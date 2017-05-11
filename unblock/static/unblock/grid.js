// Code for displaying a grid of tiles

var rows = rawTiles.length;
var columns = rawTiles[0].length;
var tileWidth = document.getElementById('canvas').width / columns;
var tileHeight = document.getElementById('canvas').height / rows;
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
            if (rawTiles[r][c] == 0) {
                this.tiles[r][c] = null;
            } else {
                this.tiles[r][c] = new Tile(rawTiles[r][c]-1);
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
