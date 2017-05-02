from urllib.parse import urlparse

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from unblock.models import Puzzle


class AuthTests(TestCase):

    def setUp(self):
        User.objects.create_user(
            'daniel', 'dan@example.com', 'danpassword'
        )
        Puzzle.objects.create(name="Puzzle", tiles=b'\0\1\0\1\1\0' + b'\0'*66)

    def test_pages_with_unauthenticated_user(self):
        """
        All pages shown to an unauthenticated user should have a “Log in”
        link.
        """
        response = self.client.get(reverse('unblock:index'))
        self.assertContains(response, "Log in")
        response = self.client.get(reverse('logout'))
        self.assertContains(response, "Log in")
        puzzle_id = Puzzle.objects.all()[0].id
        response = self.client.get(
            reverse('unblock:puzzle', args=(puzzle_id,))
        )
        self.assertContains(response, "Log in")

    def test_pages_with_authenticated_user(self):
        """
        All pages shown to an authenticated user should have a “Log out”
        link and the user’s name
        """
        self.client.login(username='daniel', password='danpassword')
        response = self.client.get(reverse('unblock:index'))
        self.assertContains(response, "Log out")
        self.assertContains(response, "daniel")
        puzzle_id = Puzzle.objects.all()[0].id
        response = self.client.get(
            reverse('unblock:puzzle', args=(puzzle_id,))
        )
        self.assertContains(response, "Log out")
        self.assertContains(response, "daniel")
        response = self.client.get(reverse('unblock:create'))
        self.assertContains(response, "Log out")
        self.assertContains(response, "daniel")

    def test_create_with_unauthenticated_user(self):
        """
        Unathenticated users are not be allowed to create puzzles.  They
        should be prompted to log in.
        """
        response = self.client.get(reverse('unblock:create'), follow=True)
        self.assertEqual(response.redirect_chain[0][1], 302)
        self.assertEqual(
            urlparse(response.redirect_chain[0][0]).path,
            reverse('login')
        )
