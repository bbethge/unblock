var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var rows = tiles.length;
var columns = tiles[0].length;
var tileWidth = canvas.width / columns;
var tileHeight = canvas.height / rows;
var cursorRow = Math.round(rows / 2);
var cursorColumn = Math.round(columns / 2);
var deadTileLifetime = 300;
var fallingTileTimeout = 100;


var colors =
    [ '#20a020', '#108080', '#303090', '#903090', '#802020', '#a0a030'];

function Tile(color) {
    return {
        'color': color,
        'dead': false,
    };
}

var tileObjects = [];
for (var r = 0; r < rows; r++) {
    tileObjects[r] = [];
    for (var c = 0; c < columns; c++) {
        if (tiles[r][c] == 0) {
            tileObjects[r][c] = null;
        } else {
            tileObjects[r][c] = Tile(tiles[r][c]-1);
        }
    }
}

function drawCanvas() {
    context.fillStyle = '#bbbbbb';
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < columns; c++) {
            if (tileObjects[r][c] !== null) {
                if (tileObjects[r][c].dead) {
                    context.fillStyle = 'black';
                } else {
                    context.fillStyle = colors[tileObjects[r][c].color];
                }
                context.fillRect(
                    c * tileWidth, r * tileHeight, tileWidth, tileHeight
                );
            }
        }
    }
    context.lineWidth = 2 * Math.round(tileWidth / 25);
    context.strokeStyle = 'white';
    context.strokeRect(
        (cursorColumn-1) * tileWidth, cursorRow * tileHeight,
        tileWidth, tileHeight
    );
    context.strokeRect(
        cursorColumn * tileWidth, cursorRow * tileHeight,
        tileWidth, tileHeight
    );
}

function markDyingTiles() {
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < columns - 2; c++) {
            if (
                tileObjects[r][c] !== null
                && tileObjects[r][c+1] !== null
                && tileObjects[r][c+1].color == tileObjects[r][c].color
                && tileObjects[r][c+2] !== null
                && tileObjects[r][c+2].color == tileObjects[r][c].color
            ) {
                tileObjects[r][c].dying = true;
                tileObjects[r][c+1].dying = true;
                tileObjects[r][c+2].dying = true;
            }
        }
    }
    for (var r = 0; r < rows - 2; r++) {
        for (var c = 0; c < columns; c++) {
            if (
                tileObjects[r][c] !== null
                && tileObjects[r+1][c] !== null
                && tileObjects[r+1][c].color == tileObjects[r][c].color
                && tileObjects[r+2][c] !== null
                && tileObjects[r+2][c].color == tileObjects[r][c].color
            ) {
                tileObjects[r][c].dying = true;
                tileObjects[r+1][c].dying = true;
                tileObjects[r+2][c].dying = true;
            }
        }
    }
    var deadTiles = false;
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < columns; c++) {
            if (tileObjects[r][c] !== null && tileObjects[r][c].dying) {
                tileObjects[r][c].dead = true;
                deadTiles = true;
                setTimeout((function (r, c) {
                    tileObjects[r][c] = null;
                }), deadTileLifetime, r, c);
                delete tileObjects[r][c].dying;
            }
        }
    }
    if (deadTiles) {
        setTimeout((function() {
            moveFallingTiles();
            drawCanvas();
        }), deadTileLifetime);
    }
}

function moveFallingTiles() {
    var fallingTiles = false;
    for (var r = rows - 2; r >= 0; r--) {
        for (var c = 0; c < columns; c++) {
            if (
                tileObjects[r][c] !== null && !tileObjects[r][c].dead
                && (
                    tileObjects[r+1][c] === null
                    || tileObjects[r+1][c].falling
                )
            ) {
                fallingTiles = true;
                // FIXME: what if the player changes tileObjects[r][c]
                // before the timeout?
                tileObjects[r][c].falling = true;
                setTimeout((function (r, c) {
                    if (tileObjects[r+1][c] === null) {
                        tileObjects[r+1][c] = tileObjects[r][c];
                        delete tileObjects[r+1][c].falling;
                        tileObjects[r][c] = null;
                    }
                }), fallingTileTimeout, r, c);
            }
        }
    }
    if (fallingTiles) {
        setTimeout((function () {
            moveFallingTiles();
            drawCanvas();
        }), fallingTileTimeout);
    } else {
        markDyingTiles();
    }
}

canvas.onmousemove = function (event) {
    // TODO: check whether layerX/layerY are standard
    var x = event.layerX - canvas.offsetLeft;
    var y = event.layerY - canvas.offsetTop;
    cursorRow = Math.min(Math.floor(y / tileHeight), rows - 1);
    cursorColumn = Math.min(
        Math.max(1, Math.round(x / tileWidth)), columns - 1
    );
    drawCanvas();
}

canvas.onclick = function (event) {
    if (
        event.button == 0
        && (
            tileObjects[cursorRow][cursorColumn-1] === null
            || !tileObjects[cursorRow][cursorColumn-1].dead
        )
        && (
            tileObjects[cursorRow][cursorColumn] === null
            || !tileObjects[cursorRow][cursorColumn].dead
        )
    ) {
        var swap = tileObjects[cursorRow][cursorColumn];
        tileObjects[cursorRow][cursorColumn] =
            tileObjects[cursorRow][cursorColumn-1];
        tileObjects[cursorRow][cursorColumn-1] = swap;
        moveFallingTiles();
        markDyingTiles();
        drawCanvas();
    }
}

drawCanvas();
