from django.shortcuts import get_object_or_404, render
from django.contrib.auth.decorators import login_required

from .models import Puzzle, num_rows, num_columns, num_colors


def index(request):
    latest_puzzle_list = Puzzle.objects.order_by('-pub_date')[:10]
    context = { 'latest_puzzle_list': latest_puzzle_list }
    return render(request, 'unblock/index.html', context)

def puzzle(request, puzzle_id):
    p = get_object_or_404(Puzzle, pk=puzzle_id)
    context = {
        'puzzle': p,
        'tiles': [
            [
                int(p.tiles[num_columns*(num_rows-r-1)+c])
                for c in range(num_columns)
            ]
            for r in range(num_rows)
        ],
    }
    return render(request, 'unblock/puzzle.html', context)

@login_required
def create(request):
    context = {
        'tiles': [[0]*num_columns for i in range(num_rows)], 
        'num_colors': num_colors,
    }
    return render(request, 'unblock/create.html', context);
