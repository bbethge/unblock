from django.conf.urls import url

from . import views

app_name = 'unblock'
urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^(?P<puzzle_id>[0-9]+)/$', views.puzzle, name='puzzle'),
    url(r'^create/$', views.create, name='create'),
]
