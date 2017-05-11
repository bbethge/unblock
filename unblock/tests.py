from django.test import TestCase
from django.urls import reverse

from django.contrib.auth.models import User

from .models import InvalidRatingError, Puzzle, max_stars, max_brains
from .models import num_rows, num_columns, num_colors


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


def create_simple_puzzle(name):
    return Puzzle.objects.create(
        name=name,
        tiles=b'\0\1\1\0\1\0'+b'\0'*(num_columns*(num_rows-1))
    )

class PuzzleViewTests(TestCase):

    def test_index_view_with_no_puzzles(self):
        """
        If no puzzles exist, an appropriate message should be displayed.
        """
        response = self.client.get(reverse('unblock:index'))
        self.assertContains(response, "No puzzles are available.")
        self.assertQuerysetEqual(response.context['latest_puzzle_list'], [])

    def test_index_view_with_one_puzzle(self):
        """
        If one puzzle exists, it should be listed by name.
        """
        puzzle = create_simple_puzzle("Simple Puzzle")
        response = self.client.get(reverse('unblock:index'))
        self.assertContains(response, "Simple Puzzle")
        self.assertQuerysetEqual(
            response.context['latest_puzzle_list'],
            ['<Puzzle: Simple Puzzle>']
        )

    def test_puzzle_view(self):
        """
        A puzzle view should show the puzzle’s name.
        """
        puzzle = create_simple_puzzle("A Simple Puzzle")
        response = self.client.get(
            reverse('unblock:puzzle', args=(puzzle.id,))
        )
        self.assertContains(response, "A Simple Puzzle")


def create_blank_puzzle_post_data(name, moves):
    result = { 'name': name, 'moves': str(moves) }
    for r in range(num_rows):
        for c in range(num_columns):
            result['tile{}_{}'.format(r, c)] = '0'
    return result

class PuzzleCreationTests(TestCase):

    def setUp(self):
        User.objects.create_user('daniel', 'dan@example.com', 'danpassword')
        self.client.login(username='daniel', password='danpassword')

    def test_create_valid_puzzle(self):
        """
        A user should be able to create a valid puzzle.
        """
        data = create_blank_puzzle_post_data("My Puzzle", 2)
        data['tile0_1'] = '1'
        data['tile0_3'] = '1'
        data['tile0_5'] = '1'
        # TODO: Use secure=True
        response = self.client.post(reverse('unblock:create_done'), data)
        self.assertRedirects(response, reverse('unblock:index'))
        self.assertEqual(len(Puzzle.objects.filter(name="My Puzzle")), 1)
        self.assertEqual(
            Puzzle.objects.filter(name="My Puzzle")[0].tiles[:num_columns],
            b'\0\1\0\1\0\1',
        )

    def test_create_puzzle_with_invalid_color(self):
        """
        A user should not be able to create a puzzle with an invalid color.
        """
        data = create_blank_puzzle_post_data("My Puzzle", 1)
        data['tile0_0'] = num_colors+1
        # TODO: Use secure=True
        response = self.client.post(reverse('unblock:create_done'), data)
        self.assertRedirects(response, reverse('unblock:create'))
        self.assertEqual(len(Puzzle.objects.filter(name="My Puzzle")), 0)
