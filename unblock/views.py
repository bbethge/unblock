from django.shortcuts import render

from .models import Puzzle


def index(request):
    latest_puzzle_list = Puzzle.objects.order_by('-pub_date')[:10]
    context = { 'latest_puzzle_list': latest_puzzle_list }
    return render(request, 'unblock/index.html', context)
