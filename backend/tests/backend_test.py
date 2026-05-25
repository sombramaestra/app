"""Backend API tests for PasionCofrade"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://pasionsevillana.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_session(session):
    r = session.post(f"{BASE_URL}/api/auth/login",
                     json={"email": "admin@pasioncofrade.com", "password": "admin123"})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    data = r.json()
    assert data["email"] == "admin@pasioncofrade.com"
    assert data["role"] == "admin"
    return session


# ---------- Auth ----------
class TestAuth:
    def test_login_success(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": "admin@pasioncofrade.com", "password": "admin123"})
        assert r.status_code == 200
        data = r.json()
        assert data["role"] == "admin"
        assert "access_token" in r.cookies

    def test_login_invalid(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": "admin@pasioncofrade.com", "password": "wrong"})
        assert r.status_code == 401

    def test_me_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_me_with_admin(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        assert r.json()["role"] == "admin"

    def test_logout(self, admin_session):
        r = admin_session.post(f"{BASE_URL}/api/auth/logout")
        assert r.status_code == 200


# ---------- Categories ----------
class TestCategories:
    def test_get_categories(self):
        r = requests.get(f"{BASE_URL}/api/categories")
        assert r.status_code == 200
        cats = r.json()
        assert isinstance(cats, list)
        slugs = [c["slug"] for c in cats]
        assert "hermandades" in slugs
        assert "eventos" in slugs
        assert "pueblos" in slugs


# ---------- Photos ----------
class TestPhotos:
    def test_get_photos(self):
        r = requests.get(f"{BASE_URL}/api/photos")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_get_photos_by_category(self):
        r = requests.get(f"{BASE_URL}/api/photos?category=hermandades")
        assert r.status_code == 200

    def test_get_nonexistent_photo(self):
        r = requests.get(f"{BASE_URL}/api/photos/nonexistent-id")
        assert r.status_code == 404

    def test_create_photo_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/photos")
        assert r.status_code in (401, 422)


# ---------- Contact ----------
class TestContact:
    def test_submit_contact(self):
        r = requests.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_User",
            "email": "test@example.com",
            "phone": "+34123456789",
            "message": "Test message"
        })
        assert r.status_code == 200
        assert "message" in r.json()

    def test_contact_invalid_email(self):
        r = requests.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST", "email": "invalid", "message": "x"
        })
        assert r.status_code == 422


# ---------- Orders ----------
class TestOrders:
    def test_create_order(self):
        r = requests.post(f"{BASE_URL}/api/orders", json={
            "items": [{"photo_id": "p1", "photo_title": "TEST Photo", "format_type": "digital", "price": 10.0}],
            "customer_name": "TEST Customer",
            "customer_email": "cust@example.com",
            "customer_phone": "+34123456789",
            "payment_method": "bizum",
            "total": 10.0
        })
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "pending"
        assert data["order_number"].startswith("PC")

    def test_orders_list_requires_admin(self):
        r = requests.get(f"{BASE_URL}/api/orders")
        assert r.status_code == 401


# ---------- Chatbot ----------
class TestChatbot:
    def test_chatbot_response(self):
        r = requests.post(f"{BASE_URL}/api/chatbot",
                          json={"message": "Hola, ¿qué tamaños de fotos ofrecen?"}, timeout=60)
        assert r.status_code == 200, f"Chatbot failed: {r.text}"
        data = r.json()
        assert "response" in data
        assert "session_id" in data
        assert len(data["response"]) > 0
