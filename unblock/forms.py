from gettext import gettext as _

from django import forms
from django.forms import ValidationError

from .models import num_rows, num_columns, max_puzzle_name_length


empty_char = '\x7F'  # Used instead of 0 for puzzle encoding in forms

def tiles_string_to_list(tiles_str):
    result = []
    for r in range(num_rows):
        result.append([])
        for c in range(num_columns):
            num = ord(tiles_str[num_columns*r+c])
            result[r].append(num if num != ord(empty_char) else 0)
    return result

def validate_no_floating_tiles(tiles_str):
    tiles = tiles_string_to_list(tiles_str)
    for c in range(num_columns):
        for r in range(1, num_rows):
            if tiles[r][c] != 0 and tiles[r-1][c] == 0:
                raise ValidationError(_('Floating tile(s)'), code='floating')

def validate_no_complete_rows_or_columns(tiles_str):
    tiles = tiles_string_to_list(tiles_str)
    for r in range(num_rows):
        for c in range(num_columns-2):
            if tiles[r][c] == tiles[r][c+1] == tiles[r][c+2] != 0:
                raise ValidationError(_('Complete row'), code='complete')
    for r in range(num_rows-2):
        for c in range(num_columns):
            if tiles[r][c] == tiles[r+1][c] == tiles[r+2][c] != 0:
                raise ValidationError(_('Complete column'), code='complete')


class PuzzleForm(forms.Form):
    name = forms.CharField(
        label="Puzzle name", max_length=max_puzzle_name_length
    )
    moves = forms.IntegerField(min_value=1)
    tiles = forms.CharField(
        min_length=num_rows*num_columns,
        max_length=num_rows*num_columns,
        validators=[
            validate_no_floating_tiles,
            validate_no_complete_rows_or_columns
        ],
        widget=forms.widgets.HiddenInput()
    )
