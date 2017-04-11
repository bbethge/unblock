from django.http import HttpResponse


def index(request):
    return HttpResponse("Congratulations, you’re at the Unblock index.")
