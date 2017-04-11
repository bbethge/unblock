from django.test import TestCase

from .models import InvalidRatingError, Puzzle, max_stars, max_brains


class PuzzleMethodTests(TestCase):

    def test_rating_and_difficulty_rating(self):
        """
        rating() should return the average of all ratings received;
        likewise with difficulty_rating().
        """
        puzzle = Puzzle()
        puzzle.rate(4)
        puzzle.rate_difficulty(5)
        puzzle.rate(2)
        puzzle.rate_difficulty(4)
        puzzle.rate(1)
        puzzle.rate_difficulty(1)
        puzzle.rate(2)
        puzzle.rate_difficulty(3)
        self.assertAlmostEqual(puzzle.rating(), 2.25)
        self.assertAlmostEqual(puzzle.difficulty_rating(), 3.25)

    def test_rate_with_invalid_argument(self):
        """
        rate() should only accept numbers from 1 to max_stars.
        """
        puzzle = Puzzle()
        with self.assertRaises(InvalidRatingError):
            puzzle.rate(max_stars+1)
        with self.assertRaises(InvalidRatingError):
            puzzle.rate(0)
        with self.assertRaises(InvalidRatingError):
            puzzle.rate(-2)

    def test_rate_difficulty_with_invalid_argument(self):
        """
        rate_difficulty() should only accept numbers from 1 to max_brains.
        """
        puzzle = Puzzle()
        with self.assertRaises(InvalidRatingError):
            puzzle.rate_difficulty(max_brains+1)
        with self.assertRaises(InvalidRatingError):
            puzzle.rate_difficulty(0)
        with self.assertRaises(InvalidRatingError):
            puzzle.rate_difficulty(-2)
