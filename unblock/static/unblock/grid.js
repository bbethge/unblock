// Code for displaying a grid of tiles
// Expects three variables to be predefined:
// emptyChar: character to represent an empty cell
// rows: the number of rows in the tile grid
// columns: the number of columns in the tile grid

var tileWidth = document.getElementById('canvas').width / columns;
var tileHeight = document.getElementById('canvas').height / rows;
var backgroundColor = '#bbbbbb';
var colors =
    [ '#20a020', '#108080', '#303090', '#903090', '#802020', '#a0a030'];

function Tile(color) {
    this.color = color;
}

function Grid(rawTiles, context) {
    function rawTileValue(r, c) {
        num = rawTiles.charCodeAt(columns*(rows-r-1)+c);
        return num != emptyChar.charCodeAt(0) ? num : 0
    }
    this.tiles = [];
    for (var r = 0; r < rows; r++) {
        this.tiles[r] = [];
        for (var c = 0; c < columns; c++) {
            if (rawTileValue(r, c) == 0) {
                this.tiles[r][c] = null;
            } else {
                this.tiles[r][c] = new Tile(rawTileValue(r, c) - 1);
            }
        }
    }
    this.context = context;
}

Grid.prototype.draw = function () {
    this.context.fillStyle = backgroundColor;
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

Grid.prototype.getRawTiles = function () {
    result = "";
    for (var r = rows - 1; r >= 0; r--) {
        for (var c = 0; c < columns; c++) {
            if (this.tiles[r][c] !== null) {
                result = result.concat(
                    String.fromCharCode(this.tiles[r][c].color+1)
                );
            } else {
                result = result.concat(emptyChar);
            }
        }
    }
    return result;
}
