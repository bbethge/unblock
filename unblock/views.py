from django.shortcuts import get_object_or_404, render
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.urls import reverse

from .forms import PuzzleForm, empty_char
from .models import Puzzle, num_rows, num_columns, num_colors


canvas_height = 600
canvas_width = canvas_height * num_columns // num_rows
palette_width = 50
palette_height = palette_width * (num_colors+1)

def index(request):
    latest_puzzle_list = Puzzle.objects.order_by('-pub_date')[:10]
    context = { 'latest_puzzle_list': latest_puzzle_list }
    return render(request, 'unblock/index.html', context)

def puzzle(request, puzzle_id):
    p = get_object_or_404(Puzzle, pk=puzzle_id)
    context = { 
        'puzzle': p, 'num_rows': num_rows, 'num_columns': num_columns,
        'canvas_width': canvas_width, 'canvas_height': canvas_height,
        'empty_char': empty_char
    }
    return render(request, 'unblock/puzzle.html', context)

@login_required
def create(request):
    if request.method == 'POST':
        form = PuzzleForm(request.POST)
        if form.is_valid():
            Puzzle.objects.create(
                name=form.cleaned_data['name'],
                creator=request.user,
                moves=form.cleaned_data['moves'],
                tiles=bytes(form.cleaned_data['tiles'], 'ascii')
            )
            return HttpResponseRedirect(reverse('unblock:index'))
    else:
        form = PuzzleForm()
    context = {
        'form': form, 'empty_char': empty_char, 'num_colors': num_colors,
        'num_rows': num_rows, 'num_columns': num_columns,
        'canvas_width': canvas_width, 'canvas_height': canvas_height,
        'palette_width': palette_width, 'palette_height': palette_height,
    }
    return render(request, 'unblock/create.html', context)

# TODO: Probably dead code
@login_required
def create_done(request):
    tiles = []
    for r in range(num_rows):
        for c in range(num_columns):
            key_name = 'tile{}_{}'.format(r, c)
            if key_name in request.POST:
                tiles.append(int(request.POST[key_name]))
            else:
                tiles.append(0)
    Puzzle.objects.create(
        name=request.POST['name'],
        creator=request.user,
        moves=request.POST['moves'],
        tiles=bytes(tiles),
    )
    return HttpResponseRedirect(reverse('unblock:index'))
