from django.db import models


class Puzzle(models.Model):
    name = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')
    # TODO: user that created it
    stars = models.IntegerField()
    ratings = models.IntegerField()
    difficulty_points = models.IntegerField()
    difficulty_ratings = models.IntegerField()
    # TODO: actually store the tile pattern
    # TODO: figure out how to make the model depend on app configuration
