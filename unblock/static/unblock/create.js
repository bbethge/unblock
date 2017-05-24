// Extends grid.js to provide code for editing a puzzle

function EditingGrid(
    rawTiles, context, paletteContext, cursorRow, cursorColumn, textInput
) {
    Grid.call(this, rawTiles, context);
    this.paletteContext = paletteContext;
    this.cursorRow = cursorRow;
    this.cursorColumn = cursorColumn;
    this.textInput = textInput;
    this.currentColor = 1;
    this.paletteWidth = paletteContext.canvas.width;
    this.paletteTileHeight = paletteContext.canvas.height / (colors.length+1);
}
EditingGrid.prototype = Object.create(Grid.prototype);
EditingGrid.prototype.constructor = EditingGrid;

EditingGrid.prototype.draw = function () {
    Grid.prototype.draw.call(this);
    this.context.lineWidth = 2 * Math.round(tileWidth / 25);
    this.context.strokeStyle = 'white';
    this.context.strokeRect(
        this.cursorColumn * tileWidth, this.cursorRow * tileHeight,
        tileWidth, tileHeight
    );
}

EditingGrid.prototype.drawPalette = function () {
    this.paletteContext.fillStyle = backgroundColor;
    this.paletteContext.fillRect(
        0, 0, this.paletteWidth, this.paletteTileHeight
    );
    for (var i = 0; i < colors.length; i++) {
        this.paletteContext.fillStyle = colors[i];
        this.paletteContext.fillRect(
            0, (i+1) * this.paletteTileHeight,
            this.paletteWidth, this.paletteTileHeight
        );
    }
    this.paletteContext.lineWidth = 2 * Math.round(this.paletteWidth / 25);
    this.paletteContext.strokeStyle = 'white';
    this.paletteContext.strokeRect(
        this.paletteContext.lineWidth / 2,
        this.currentColor * this.paletteTileHeight
            + this.paletteContext.lineWidth / 2,
        this.paletteWidth - this.paletteContext.lineWidth / 2,
        this.paletteTileHeight - this.paletteContext.lineWidth / 2
    );
}

EditingGrid.prototype.startEditing = function () {
    this.draw();
    this.drawPalette();

    var grid = this;
    this.context.canvas.onmousemove = function (event) {
        // TODO: check whether layerX/layerY are standard
        var x = event.layerX - grid.context.canvas.offsetLeft;
        var y = event.layerY - grid.context.canvas.offsetTop;
        var oldCursorRow = grid.cursorRow;
        var oldCursorColumn = grid.cursorColumn;
        grid.cursorRow = Math.floor(y / tileHeight);
        grid.cursorColumn = Math.floor(x / tileWidth);
        if (
            oldCursorRow != grid.cursorRow
            || oldCursorColumn != grid.cursorColumn
        ) {
            grid.draw();
        }
    }
    
    this.context.canvas.onclick = function (event) {
        if (event.button == 0) {
            if (grid.currentColor > 0) {
                grid.tiles[grid.cursorRow][grid.cursorColumn] =
                    new Tile(grid.currentColor - 1);
            } else {
                grid.tiles[grid.cursorRow][grid.cursorColumn] = null;
            }
            grid.draw();
            grid.textInput.value = grid.getRawTiles();
        }
    }

    this.paletteContext.canvas.onclick = function (event) {
        // TODO: check whether layerX/layerY are standard
        var y = event.layerY - grid.paletteContext.canvas.offsetTop;
        grid.currentColor = Math.floor(y / grid.paletteTileHeight);
        grid.drawPalette();
    }
}

function repeatString(string, numTimes) {
    var result = "";
    for (var i = 0; i < numTimes; i++) {
        result = result.concat(string);
    }
    return result;
}

var textInput = document.getElementById('id_tiles');
var editingGrid = new EditingGrid(
    // TODO: retrieve the value that should be in textInput.value
    textInput.value.length == rows * columns ? textInput.value
    : repeatString(emptyChar, rows * columns), 
    document.getElementById('canvas').getContext('2d'),
    document.getElementById('palette').getContext('2d'),
    Math.round(rows / 2), Math.round(columns / 2), textInput
)
editingGrid.startEditing();
