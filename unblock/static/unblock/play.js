var rows = tiles.length;
var columns = tiles[0].length;
var tileWidth = document.getElementById('canvas').width / columns;
var tileHeight = document.getElementById('canvas').height / rows;
var deadTileLifetime = 300;
var fallingTileTimeout = 100;
var colors =
    [ '#20a020', '#108080', '#303090', '#903090', '#802020', '#a0a030'];

function Tile(color) {
    this.color = color;
}

function Grid(rawTiles, context) {
    this.tiles = [];
    for (var r = 0; r < rows; r++) {
        this.tiles[r] = [];
        for (var c = 0; c < columns; c++) {
            if (tiles[r][c] == 0) {
                this.tiles[r][c] = null;
            } else {
                this.tiles[r][c] = new Tile(tiles[r][c]-1);
            }
        }
    }
    this.context = context;
}

Grid.prototype.draw = function () {
    this.context.fillStyle = '#bbbbbb';
    this.context.fillRect(
        0, 0, this.context.canvas.width, this.context.canvas.height
    );
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < columns; c++) {
            if (this.tiles[r][c] !== null) {
                if (this.tiles[r][c].dead) {
                    this.context.fillStyle = 'black';
                } else {
                    this.context.fillStyle = colors[this.tiles[r][c].color];
                }
                this.context.fillRect(
                    c * tileWidth, r * tileHeight, tileWidth, tileHeight
                );
            }
        }
    }
}

function PlayingGrid(
    rawTiles, context, movesIndicator, cursorRow, cursorColumn
) {
    Grid.call(this, rawTiles, context);
    this.cursorRow = cursorRow;
    this.cursorColumn = cursorColumn;
    this.movesIndicator = movesIndicator;
    this.movesRemaining = movesIndicator.firstChild.data;
}
PlayingGrid.prototype = Object.create(Grid.prototype);
PlayingGrid.prototype.constructor = PlayingGrid;

PlayingGrid.prototype.draw = function () {
    Grid.prototype.draw.call(this);
    this.context.lineWidth = 2 * Math.round(tileWidth / 25);
    this.context.strokeStyle = 'white';
    this.context.strokeRect(
        (this.cursorColumn-1) * tileWidth, this.cursorRow * tileHeight,
        tileWidth, tileHeight
    );
    this.context.strokeRect(
        this.cursorColumn * tileWidth, this.cursorRow * tileHeight,
        tileWidth, tileHeight
    );
}

PlayingGrid.prototype.markDyingTiles = function () {
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < columns - 2; c++) {
            if (
                this.tiles[r][c] !== null
                && this.tiles[r][c+1] !== null
                && this.tiles[r][c+1].color == this.tiles[r][c].color
                && this.tiles[r][c+2] !== null
                && this.tiles[r][c+2].color == this.tiles[r][c].color
            ) {
                this.tiles[r][c].dying = true;
                this.tiles[r][c+1].dying = true;
                this.tiles[r][c+2].dying = true;
            }
        }
    }
    for (var r = 0; r < rows - 2; r++) {
        for (var c = 0; c < columns; c++) {
            if (
                this.tiles[r][c] !== null
                && this.tiles[r+1][c] !== null
                && this.tiles[r+1][c].color == this.tiles[r][c].color
                && this.tiles[r+2][c] !== null
                && this.tiles[r+2][c].color == this.tiles[r][c].color
            ) {
                this.tiles[r][c].dying = true;
                this.tiles[r+1][c].dying = true;
                this.tiles[r+2][c].dying = true;
            }
        }
    }
    var deadTiles = false;
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < columns; c++) {
            if (this.tiles[r][c] !== null && this.tiles[r][c].dying) {
                this.tiles[r][c].dead = true;
                deadTiles = true;
                setTimeout((function (tiles, r, c) {
                    tiles[r][c] = null;
                }), deadTileLifetime, this.tiles, r, c);
                delete this.tiles[r][c].dying;
            }
        }
    }
    if (deadTiles) {
        setTimeout((function(grid) {
            grid.moveFallingTiles();
            grid.draw();
        }), deadTileLifetime, this);
    }
}

PlayingGrid.prototype.moveFallingTiles = function() {
    var fallingTiles = false;
    for (var r = rows - 2; r >= 0; r--) {
        for (var c = 0; c < columns; c++) {
            if (
                this.tiles[r][c] !== null && !this.tiles[r][c].dead
                && (
                    this.tiles[r+1][c] === null
                    || this.tiles[r+1][c].falling
                )
            ) {
                fallingTiles = true;
                // FIXME: what if the player changes this.tiles[r][c]
                // before the timeout?
                this.tiles[r][c].falling = true;
                setTimeout((function (grid, r, c) {
                    if (grid.tiles[r+1][c] === null) {
                        grid.tiles[r+1][c] = grid.tiles[r][c];
                        delete grid.tiles[r+1][c].falling;
                        grid.tiles[r][c] = null;
                    }
                }), fallingTileTimeout, this, r, c);
            }
        }
    }
    if (fallingTiles) {
        setTimeout((function (grid) {
            grid.moveFallingTiles();
            grid.draw();
        }), fallingTileTimeout, this);
    } else {
        this.markDyingTiles();
    }
}

PlayingGrid.prototype.startGame = function() {
    this.draw();

    var grid = this;
    this.context.canvas.onmousemove = function (event) {
        // TODO: check whether layerX/layerY are standard
        var x = event.layerX - canvas.offsetLeft;
        var y = event.layerY - canvas.offsetTop;
        grid.cursorRow = Math.min(Math.floor(y / tileHeight), rows - 1);
        grid.cursorColumn = Math.min(
            Math.max(1, Math.round(x / tileWidth)), columns - 1
        );
        grid.draw();
    }

    this.context.canvas.onclick = function (event) {
        var leftMoveable =
            grid.tiles[grid.cursorRow][grid.cursorColumn-1] === null
            || !grid.tiles[grid.cursorRow][grid.cursorColumn-1].dead;
        var rightMoveable =
            grid.tiles[grid.cursorRow][grid.cursorColumn] === null
            || !grid.tiles[grid.cursorRow][grid.cursorColumn].dead;
        var bothNull =
            grid.tiles[grid.cursorRow][grid.cursorColumn-1] == null
            && grid.tiles[grid.cursorRow][grid.cursorColumn] == null;
        if (
            event.button == 0 && leftMoveable && rightMoveable && !bothNull
            && grid.movesRemaining > 0
        ) {
            var swap = grid.tiles[grid.cursorRow][grid.cursorColumn];
            grid.tiles[grid.cursorRow][grid.cursorColumn] =
                grid.tiles[grid.cursorRow][grid.cursorColumn-1];
            grid.tiles[grid.cursorRow][grid.cursorColumn-1] = swap;
            grid.movesRemaining--;
            grid.movesIndicator.replaceChild(
                document.createTextNode(grid.movesRemaining),
                grid.movesIndicator.firstChild
            );
            grid.moveFallingTiles();
            grid.markDyingTiles();
            grid.draw();
        }
    }
}

playingGrid = new PlayingGrid(
    tiles, document.getElementById('canvas').getContext('2d'),
    document.getElementById('moves_remaining'),
    Math.round(rows/2), Math.round(columns/2)
);
playingGrid.startGame();
