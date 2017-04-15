var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var rows = tiles.length;
var columns = tiles[0].length;
var tileWidth = canvas.width / columns;
var tileHeight = canvas.height / rows;
var cursorRow = Math.round(rows / 2);
var cursorColumn = Math.round(columns / 2);


var colors =
    [ '#20a020', '#108080', '#303090', '#903090', '#802020', '#a0a030'];

function drawCanvas() {
    context.fillStyle = '#bbbbbb';
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < columns; c++) {
            if (tiles[r][c] > 0) {
                context.fillStyle = colors[tiles[r][c]-1];
                context.fillRect(
                    c * tileWidth, r * tileHeight, tileWidth, tileHeight
                );
            }
            else if (tiles[r][c] < 0) {
                context.fillStyle = 'black';
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
                tiles[r][c] != 0
                && Math.abs(tiles[r][c]) == Math.abs(tiles[r][c+1])
                && Math.abs(tiles[r][c]) == Math.abs(tiles[r][c+2])
            ) {
                tiles[r][c] = -Math.abs(tiles[r][c]);
                tiles[r][c+1] = -Math.abs(tiles[r][c]);
                tiles[r][c+2] = -Math.abs(tiles[r][c]);
            }
        }
    }
    for (var c = 0; c < columns; c++) {
        for (var r = 0; r < rows - 2; r++) {
            if (
                tiles[r][c] != 0
                && Math.abs(tiles[r][c]) == Math.abs(tiles[r+1][c])
                && Math.abs(tiles[r][c]) == Math.abs(tiles[r+2][c])
            ) {
                tiles[r][c] = -Math.abs(tiles[r][c]);
                tiles[r+1][c] = -Math.abs(tiles[r][c]);
                tiles[r+2][c] = -Math.abs(tiles[r][c]);
            }
        }
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
    if (event.button == 0) {
        var swap = tiles[cursorRow][cursorColumn];
        tiles[cursorRow][cursorColumn] = tiles[cursorRow][cursorColumn-1]
        tiles[cursorRow][cursorColumn-1] = swap;
        markDyingTiles();
        drawCanvas();
    }
}

drawCanvas();
