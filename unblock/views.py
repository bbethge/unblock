from django.shortcuts import get_object_or_404, render

from .models import Puzzle, num_rows, num_columns


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
