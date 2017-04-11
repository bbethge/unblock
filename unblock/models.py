from django.db import models


num_rows = 12
num_columns = 6
num_colors = 6  # Maximum 255
max_stars = 5
max_brains = 5


class InvalidRatingError(Exception):
    pass


class Puzzle(models.Model):
    name = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published', auto_now_add=True)
    # TODO: user that created it
    stars = models.IntegerField(default=0)
    ratings = models.IntegerField(default=0)
    difficulty_points = models.IntegerField(default=0)
    difficulty_ratings = models.IntegerField(default=0)
    # Stored in row-major order from bottom; 0=empty; 1..max_colors=tile color
    tiles = models.BinaryField(
        max_length=num_rows*num_columns,
        default=b'\0'*(num_rows*num_columns)
    )
    # TODO: figure out how to make the model depend on app configuration

    def rate(self, num_stars):
        if num_stars < 1 or num_stars > max_stars:
            raise InvalidRatingError()
        self.stars += num_stars
        self.ratings += 1
        self.save()

    def rate_difficulty(self, num_brains):
        if num_brains < 1 or num_brains > max_brains:
            raise InvalidRatingError()
        self.difficulty_points += num_brains
        self.difficulty_ratings += 1
        self.save()

    def rating(self):
        return self.stars / self.ratings

    def difficulty_rating(self):
        return self.difficulty_points / self.difficulty_ratings
