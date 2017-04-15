var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var rows = tiles.length;
var columns = tiles[0].length;
var tile_width = canvas.width / columns;
var tile_height = canvas.height / rows;
var cursor_row = Math.round(rows / 2);
var cursor_column = Math.round(columns / 2);


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
                    c * tile_width, r * tile_height, tile_width, tile_height
                );
            }
        }
    }
    context.lineWidth = 2 * Math.round(tile_width / 25);
    context.strokeStyle = '#ffffff';
    context.strokeRect(
        (cursor_column-1) * tile_width, cursor_row * tile_height,
        tile_width, tile_height
    );
    context.strokeRect(
        cursor_column * tile_width, cursor_row * tile_height,
        tile_width, tile_height
    );
}

canvas.onmousemove = function (event) {
    // TODO: check whether layerX/layerY are standard
    var x = event.layerX - canvas.offsetLeft;
    var y = event.layerY - canvas.offsetTop;
    cursor_row = Math.min(Math.floor(y / tile_height), rows - 1);
    cursor_column = Math.min(
        Math.max(1, Math.round(x / tile_width)), columns - 1
    );
    drawCanvas();
}

canvas.onclick = function (event) {
    if (event.button == 0) {
        var swap = tiles[cursor_row][cursor_column];
        tiles[cursor_row][cursor_column] = tiles[cursor_row][cursor_column-1]
        tiles[cursor_row][cursor_column-1] = swap;
        drawCanvas();
    }
}

drawCanvas();
