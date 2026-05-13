import json
from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase, RequestFactory, Client, override_settings
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.contrib.messages.middleware import MessageMiddleware
from django.contrib.sessions.middleware import SessionMiddleware
from django.conf import settings

from Storefront.models import Book, Genre, Inventory, Order, UserBook
from Storefront.views import CatalogView
from AdminPanel.models import GamificationConfig
from Authentication.jwt_utils import encode_token, decode_token, get_user_from_token
from Authentication.views import SignUpView, LoginView
from config.middleware import JWTCookieMiddleware, LoginRequiredMiddleware, AdminRoleMiddleware

User = get_user_model()


class JWTHelperTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com",
            password="pass1234", name="Test User"
        )

    def test_encode_decode_token(self):
        token = encode_token(self.user)
        self.assertIsNotNone(token)
        payload = decode_token(token)
        self.assertEqual(payload["user_id"], self.user.id)
        self.assertEqual(payload["email"], self.user.email)

    def test_decode_invalid_token(self):
        self.assertIsNone(decode_token("invalidtoken"))

    def test_get_user_from_token(self):
        token = encode_token(self.user)
        user = get_user_from_token(token)
        self.assertEqual(user, self.user)

    def test_get_user_from_invalid_token(self):
        self.assertIsNone(get_user_from_token("invalid"))

    def test_get_user_from_nonexistent_user(self):
        token = encode_token(self.user)
        self.user.delete()
        self.assertIsNone(get_user_from_token(token))


class SignUpViewTests(TestCase):
    def setUp(self):
        GamificationConfig.objects.create(pk=1, signup_bonus=50, login_points=10)

    def test_get_signup_form(self):
        resp = self.client.get("/signup/")
        self.assertEqual(resp.status_code, 200)
        self.assertTemplateUsed(resp, "Authentication/signup.html")

    def test_get_signup_redirects_when_authenticated(self):
        user = User.objects.create_user(
            username="existing", email="existing@example.com",
            password="pass", name="Existing"
        )
        self.client.force_login(user)
        resp = self.client.get("/signup/")
        self.assertRedirects(resp, "/store/")

    def test_signup_success(self):
        resp = self.client.post("/signup/", {
            "email": "new@example.com",
            "name": "New User",
            "password": "securePass123!",
        })
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.content)
        self.assertTrue(data["success"])
        self.assertIn("token", data)
        self.assertEqual(data["redirect"], "/store/")
        self.assertIn("jwt_token", resp.cookies)
        user = User.objects.get(email="new@example.com")
        self.assertEqual(user.points, 50)
        self.assertEqual(user.last_active, date.today())

    def test_signup_duplicate_email(self):
        User.objects.create_user(
            username="existing", email="dup@example.com",
            password="pass", name="Existing"
        )
        resp = self.client.post("/signup/", {
            "email": "dup@example.com",
            "name": "New User",
            "password": "securePass123!",
        })
        self.assertEqual(resp.status_code, 400)
        data = json.loads(resp.content)
        self.assertFalse(data["success"])

    def test_signup_missing_password(self):
        resp = self.client.post("/signup/", {
            "email": "new@example.com",
            "name": "New User",
            "password": "",
        })
        self.assertEqual(resp.status_code, 400)
        data = json.loads(resp.content)
        self.assertFalse(data["success"])


class LoginViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com",
            password="pass1234", name="Test User", role="user",
            points=100
        )
        GamificationConfig.objects.create(pk=1, signup_bonus=50, login_points=10)

    def test_get_login_form(self):
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        self.assertTemplateUsed(resp, "Authentication/login.html")

    def test_get_login_redirects_when_authenticated(self):
        self.client.force_login(self.user)
        resp = self.client.get("/")
        self.assertRedirects(resp, "/store/")

    def test_login_success(self):
        resp = self.client.post("/", {
            "email": "test@example.com",
            "password": "pass1234",
        })
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.content)
        self.assertTrue(data["success"])
        self.assertIn("token", data)
        self.assertEqual(data["redirect"], "/store/")
        self.assertIn("jwt_token", resp.cookies)

    def test_login_invalid_credentials(self):
        resp = self.client.post("/", {
            "email": "test@example.com",
            "password": "wrongpass",
        })
        self.assertEqual(resp.status_code, 400)
        data = json.loads(resp.content)
        self.assertFalse(data["success"])

    def test_login_awards_daily_points_next_day(self):
        yesterday = date.today() - timedelta(days=1)
        User.objects.filter(pk=self.user.pk).update(last_active=yesterday, points=100)
        resp = self.client.post("/", {
            "email": "test@example.com",
            "password": "pass1234",
        })
        self.assertEqual(resp.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.points, 110)
        self.assertEqual(self.user.last_active, date.today())

    def test_login_does_not_award_points_same_day(self):
        today = date.today()
        self.user.last_active = today
        self.user.points = 100
        self.user.save()
        resp = self.client.post("/", {
            "email": "test@example.com",
            "password": "pass1234",
        })
        self.assertEqual(resp.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.points, 100)

    def test_login_admin_redirects_to_admin_panel(self):
        self.user.role = "admin"
        self.user.save()
        resp = self.client.post("/", {
            "email": "test@example.com",
            "password": "pass1234",
        })
        data = json.loads(resp.content)
        self.assertEqual(data["redirect"], "/admin-panel/")


class LogoutViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com",
            password="pass1234", name="Test User"
        )

    def test_logout(self):
        self.client.force_login(self.user)
        resp = self.client.get("/logout/")
        self.assertRedirects(resp, "/")


class JWTCookieMiddlewareTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="jwtuser", email="jwt@example.com",
            password="pass1234", name="JWT User"
        )

    def _get_response(self, request):
        return None

    def test_authenticated_user_not_overwritten(self):
        factory = RequestFactory()
        request = factory.get("/store/")
        middleware = SessionMiddleware(self._get_response)
        middleware(request)
        request.user = self.user
        middleware = JWTCookieMiddleware(self._get_response)
        middleware(request)
        self.assertEqual(request.user, self.user)

    def test_jwt_cookie_sets_user(self):
        token = encode_token(self.user)
        factory = RequestFactory()
        request = factory.get("/store/", HTTP_COOKIE=f"jwt_token={token}")
        middleware = SessionMiddleware(self._get_response)
        middleware(request)
        from django.contrib.auth.middleware import AuthenticationMiddleware
        auth_mw = AuthenticationMiddleware(self._get_response)
        auth_mw(request)
        middleware = JWTCookieMiddleware(self._get_response)
        middleware(request)
        self.assertTrue(request.user.is_authenticated)
        self.assertEqual(request.user.id, self.user.id)

    def test_invalid_jwt_cookie_anonymous(self):
        factory = RequestFactory()
        request = factory.get("/store/", HTTP_COOKIE="jwt_token=invalid")
        middleware = SessionMiddleware(self._get_response)
        middleware(request)
        from django.contrib.auth.middleware import AuthenticationMiddleware
        auth_mw = AuthenticationMiddleware(self._get_response)
        auth_mw(request)
        middleware = JWTCookieMiddleware(self._get_response)
        middleware(request)
        self.assertFalse(request.user.is_authenticated)


class LoginRequiredMiddlewareTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com",
            password="pass1234", name="Test User"
        )

    def _get_response(self, request):
        return None

    def _make_request(self, path):
        factory = RequestFactory()
        request = factory.get(path)
        sess_mw = SessionMiddleware(self._get_response)
        sess_mw(request)
        from django.contrib.auth.middleware import AuthenticationMiddleware
        auth_mw = AuthenticationMiddleware(self._get_response)
        auth_mw(request)
        return request

    def test_redirects_anonymous_to_login(self):
        request = self._make_request("/store/store/")
        mw = LoginRequiredMiddleware(self._get_response)
        resp = mw(request)
        self.assertEqual(resp.status_code, 302)
        self.assertEqual(resp.url, "/")

    def test_allows_anonymous_on_signup(self):
        request = self._make_request("/signup/")
        mw = LoginRequiredMiddleware(self._get_response)
        resp = mw(request)
        self.assertIsNone(resp)

    def test_allows_anonymous_on_home_root(self):
        request = self._make_request("/")
        mw = LoginRequiredMiddleware(self._get_response)
        resp = mw(request)
        self.assertIsNone(resp)

    def test_allows_anonymous_on_admin(self):
        request = self._make_request("/admin/")
        mw = LoginRequiredMiddleware(self._get_response)
        resp = mw(request)
        self.assertIsNone(resp)

    def test_allows_anonymous_on_static(self):
        request = self._make_request("/static/css/style.css")
        mw = LoginRequiredMiddleware(self._get_response)
        resp = mw(request)
        self.assertIsNone(resp)

    def test_allows_authenticated_users(self):
        request = self._make_request("/store/store/")
        request.user = self.user
        mw = LoginRequiredMiddleware(self._get_response)
        resp = mw(request)
        self.assertIsNone(resp)


class AdminRoleMiddlewareTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin", email="admin@example.com",
            password="admin123", name="Admin", role="admin"
        )
        self.normal_user = User.objects.create_user(
            username="user", email="user@example.com",
            password="user123", name="User", role="user"
        )
        self.staff_user = User.objects.create_user(
            username="staff", email="staff@example.com",
            password="staff123", name="Staff", role="user", is_staff=True
        )

    def _get_response(self, request):
        return None

    def _make_request(self, path, user):
        factory = RequestFactory()
        request = factory.get(path)
        sess_mw = SessionMiddleware(self._get_response)
        sess_mw(request)
        from django.contrib.auth.middleware import AuthenticationMiddleware
        auth_mw = AuthenticationMiddleware(self._get_response)
        auth_mw(request)
        msg_mw = MessageMiddleware(self._get_response)
        msg_mw(request)
        request.user = user
        return request

    def test_admin_can_access_admin_panel(self):
        request = self._make_request("/admin-panel/", self.admin)
        mw = AdminRoleMiddleware(self._get_response)
        resp = mw(request)
        self.assertIsNone(resp)

    def test_normal_user_blocked_from_admin_panel(self):
        request = self._make_request("/admin-panel/", self.normal_user)
        mw = AdminRoleMiddleware(self._get_response)
        resp = mw(request)
        self.assertEqual(resp.status_code, 302)
        self.assertEqual(resp.url, "/store/")

    def test_staff_can_access_admin_panel(self):
        request = self._make_request("/admin-panel/", self.staff_user)
        mw = AdminRoleMiddleware(self._get_response)
        resp = mw(request)
        self.assertIsNone(resp)

    def test_admin_can_access_django_admin(self):
        request = self._make_request("/admin/", self.admin)
        mw = AdminRoleMiddleware(self._get_response)
        resp = mw(request)
        self.assertIsNone(resp)

    def test_normal_user_blocked_from_django_admin(self):
        request = self._make_request("/admin/", self.normal_user)
        messages_mw = MessageMiddleware(self._get_response)
        messages_mw(request)
        mw = AdminRoleMiddleware(self._get_response)
        resp = mw(request)
        self.assertEqual(resp.status_code, 302)
        self.assertEqual(resp.url, "/store/")

    def test_unauthenticated_redirected_to_login(self):
        request = self._make_request("/admin-panel/", None)
        request.user = type("Anonymous", (), {"is_authenticated": False, "role": "", "is_staff": False})()
        mw = AdminRoleMiddleware(self._get_response)
        resp = mw(request)
        self.assertEqual(resp.status_code, 302)
        self.assertEqual(resp.url, "/")

    def test_admin_login_allowed(self):
        request = self._make_request("/admin/login/", self.normal_user)
        mw = AdminRoleMiddleware(self._get_response)
        resp = mw(request)
        self.assertIsNone(resp)


@override_settings(ROOT_URLCONF="config.urls")
class BuyBookTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="buyer", email="buyer@example.com",
            password="pass1234", name="Buyer", points=5000, role="user"
        )
        self.genre = Genre.objects.create(name="Test", slug="test")
        self.book = Book.objects.create(
            id=1, title="Test Book", author="Author",
            price=1000, pages=200, rating=4.5,
            published_date="2024", description="A test book",
            genre=self.genre
        )
        self.inventory = Inventory.objects.create(
            book=self.book, isbn="1234567890", sku="SKU001",
            stock=10, max_stock=100
        )

    def test_buy_book_deducts_points(self):
        self.client.force_login(self.user)
        resp = self.client.post(f"/store/book/{self.book.id}/buy/")
        self.assertRedirects(resp, f"/store/book/{self.book.id}/")
        self.user.refresh_from_db()
        self.assertEqual(self.user.points, 4000)

    def test_buy_book_not_enough_points(self):
        self.user.points = 500
        self.user.save()
        self.client.force_login(self.user)
        resp = self.client.post(f"/store/book/{self.book.id}/buy/")
        self.assertRedirects(resp, f"/store/book/{self.book.id}/")
        self.user.refresh_from_db()
        self.assertEqual(self.user.points, 500)

    def test_buy_book_adds_userbook(self):
        self.client.force_login(self.user)
        self.client.post(f"/store/book/{self.book.id}/buy/")
        self.assertTrue(
            UserBook.objects.filter(user=self.user, book=self.book, ownership_type="bought").exists()
        )

    def test_buy_book_creates_order(self):
        self.client.force_login(self.user)
        self.client.post(f"/store/book/{self.book.id}/buy/")
        self.assertTrue(
            Order.objects.filter(customer=self.user, book=self.book, status="completed").exists()
        )

    def test_buy_book_decrements_stock(self):
        self.client.force_login(self.user)
        self.client.post(f"/store/book/{self.book.id}/buy/")
        self.inventory.refresh_from_db()
        self.assertEqual(self.inventory.stock, 9)

    def test_buy_already_owned_book(self):
        UserBook.objects.create(user=self.user, book=self.book, ownership_type="bought")
        self.client.force_login(self.user)
        resp = self.client.post(f"/store/book/{self.book.id}/buy/")
        self.user.refresh_from_db()
        self.assertEqual(self.user.points, 5000)

    def test_buy_out_of_stock_book(self):
        self.inventory.stock = 0
        self.inventory.save()
        self.client.force_login(self.user)
        resp = self.client.post(f"/store/book/{self.book.id}/buy/")
        self.user.refresh_from_db()
        self.assertEqual(self.user.points, 5000)


@override_settings(ROOT_URLCONF="config.urls")
class StoreFilterTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="filteruser", email="filter@example.com",
            password="pass1234", name="Filter User"
        )
        self.genre_religious = Genre.objects.create(name="Religious", slug="religious")
        self.genre_programming = Genre.objects.create(name="Programming", slug="programming")
        self.book1 = Book.objects.create(
            id=10, title="Religious Book", author="Author",
            price=1500, pages=100, rating=4.0,
            published_date="2024", description="A religious book",
            genre=self.genre_religious
        )
        self.book2 = Book.objects.create(
            id=11, title="Programming Book", author="Author",
            price=4500, pages=200, rating=4.5,
            published_date="2024", description="A programming book",
            genre=self.genre_programming
        )
        self.client.force_login(self.user)

    def test_no_filter_shows_all_books(self):
        resp = self.client.get("/store/store/", {"sort": "popularity", "maxPrice": 20000, "minPrice": 0})
        self.assertEqual(resp.status_code, 200)
        self.assertIn(self.book1, resp.context["page_obj"])
        self.assertIn(self.book2, resp.context["page_obj"])

    def test_category_filter(self):
        resp = self.client.get("/store/store/", {
            "category": "Religious", "sort": "popularity", "maxPrice": 20000, "minPrice": 0
        })
        self.assertEqual(resp.status_code, 200)
        self.assertIn(self.book1, resp.context["page_obj"])
        self.assertNotIn(self.book2, resp.context["page_obj"])

    def test_price_filter_excludes_expensive(self):
        resp = self.client.get("/store/store/", {
            "sort": "popularity", "maxPrice": 2000, "minPrice": 0
        })
        self.assertEqual(resp.status_code, 200)
        self.assertIn(self.book1, resp.context["page_obj"])
        self.assertNotIn(self.book2, resp.context["page_obj"])

    def test_high_maxPrice_includes_all(self):
        resp = self.client.get("/store/store/", {
            "sort": "popularity", "maxPrice": 20000, "minPrice": 0
        })
        self.assertEqual(resp.status_code, 200)
        self.assertIn(self.book1, resp.context["page_obj"])
        self.assertIn(self.book2, resp.context["page_obj"])

    def test_combined_category_and_price_filter(self):
        resp = self.client.get("/store/store/", {
            "category": "Programming", "sort": "popularity", "maxPrice": 2000, "minPrice": 0
        })
        self.assertEqual(resp.status_code, 200)
        self.assertNotIn(self.book1, resp.context["page_obj"])
        self.assertNotIn(self.book2, resp.context["page_obj"])

    def test_sort_by_price_ascending(self):
        resp = self.client.get("/store/store/", {
            "sort": "price-low", "maxPrice": 20000, "minPrice": 0
        })
        page = resp.context["page_obj"]
        prices = [b.price for b in page]
        self.assertEqual(prices, sorted(prices))

    def test_sort_by_title(self):
        resp = self.client.get("/store/store/", {
            "sort": "title", "maxPrice": 20000, "minPrice": 0
        })
        page = resp.context["page_obj"]
        titles = [b.title for b in page]
        self.assertEqual(titles, sorted(titles))
