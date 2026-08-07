import os
import unittest
from decimal import Decimal


os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
os.environ.setdefault(
    "JWT_SECRET_KEY",
    "test-only-secret-key-that-is-long-enough",
)

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.dependencies import get_db
from app.db.base import Base
from app.main import app
from app.models import Transaction, User  # noqa: F401


engine = create_engine(
    "sqlite+pysqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)


def override_get_db():
    with TestingSessionLocal() as database:
        yield database


class SavefolioApiTests(unittest.TestCase):
    def setUp(self) -> None:
        Base.metadata.create_all(bind=engine)
        app.dependency_overrides[get_db] = override_get_db
        self.client = TestClient(app)

    def tearDown(self) -> None:
        self.client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()

    def assert_status(self, response, expected: int) -> None:
        self.assertEqual(
            response.status_code,
            expected,
            response.text,
        )

    def register(
        self,
        email: str,
        name: str = "Test User",
        password: str = "password123",
    ) -> dict:
        response = self.client.post(
            "/api/v1/auth/register",
            json={
                "name": name,
                "email": email,
                "password": password,
            },
        )
        self.assert_status(response, 201)
        return response.json()

    def login(
        self,
        email: str,
        password: str = "password123",
    ) -> dict:
        response = self.client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": password},
        )
        self.assert_status(response, 200)
        return response.json()

    def auth_headers(self, email: str) -> dict[str, str]:
        token = self.login(email)["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def create_transaction(
        self,
        headers: dict[str, str],
        *,
        title: str = "Grocery shopping",
        amount: str = "45.50",
        transaction_type: str = "expense",
        category: str = "Food",
        transaction_date: str = "2026-08-05",
    ) -> dict:
        response = self.client.post(
            "/api/v1/transactions/",
            headers=headers,
            json={
                "title": title,
                "amount": amount,
                "transaction_type": transaction_type,
                "category": category,
                "transaction_date": transaction_date,
                "notes": "Created by an API test",
            },
        )
        self.assert_status(response, 201)
        return response.json()

    def test_health_registration_login_and_current_user(self) -> None:
        health = self.client.get("/api/v1/health/")
        self.assert_status(health, 200)
        self.assertEqual(health.json()["status"], "healthy")

        user = self.register("person@example.com", name="  Test   User  ")
        self.assertEqual(user["name"], "Test User")
        self.assertEqual(user["email"], "person@example.com")

        duplicate = self.client.post(
            "/api/v1/auth/register",
            json={
                "name": "Another Name",
                "email": "PERSON@example.com",
                "password": "password123",
            },
        )
        self.assert_status(duplicate, 409)

        headers = self.auth_headers("PERSON@example.com")
        current_user = self.client.get(
            "/api/v1/auth/me",
            headers=headers,
        )
        self.assert_status(current_user, 200)
        self.assertEqual(current_user.json()["id"], user["id"])

        unauthenticated = self.client.get("/api/v1/auth/me")
        self.assert_status(unauthenticated, 401)

    def test_transaction_crud_filters_and_ownership(self) -> None:
        self.register("owner@example.com")
        self.register("other@example.com", name="Other User")
        owner_headers = self.auth_headers("owner@example.com")
        other_headers = self.auth_headers("other@example.com")

        expense = self.create_transaction(owner_headers)
        income = self.create_transaction(
            owner_headers,
            title="August salary",
            amount="2000.00",
            transaction_type="income",
            category="Salary",
        )

        filtered = self.client.get(
            "/api/v1/transactions/?type=income&search=salary",
            headers=owner_headers,
        )
        self.assert_status(filtered, 200)
        self.assertEqual(filtered.json()["total"], 1)
        self.assertEqual(filtered.json()["items"][0]["id"], income["id"])

        forbidden_read = self.client.get(
            f"/api/v1/transactions/{expense['id']}",
            headers=other_headers,
        )
        self.assert_status(forbidden_read, 404)

        updated = self.client.patch(
            f"/api/v1/transactions/{expense['id']}",
            headers=owner_headers,
            json={"title": "Weekly groceries", "amount": "50.00"},
        )
        self.assert_status(updated, 200)
        self.assertEqual(updated.json()["title"], "Weekly groceries")

        deleted = self.client.delete(
            f"/api/v1/transactions/{expense['id']}",
            headers=owner_headers,
        )
        self.assert_status(deleted, 204)

        missing = self.client.get(
            f"/api/v1/transactions/{expense['id']}",
            headers=owner_headers,
        )
        self.assert_status(missing, 404)

    def test_dashboard_totals(self) -> None:
        self.register("dashboard@example.com")
        headers = self.auth_headers("dashboard@example.com")
        self.create_transaction(
            headers,
            title="Salary payment",
            amount="3000.00",
            transaction_type="income",
            category="Salary",
        )
        self.create_transaction(
            headers,
            amount="750.25",
        )

        response = self.client.get(
            "/api/v1/dashboard/",
            headers=headers,
        )
        self.assert_status(response, 200)
        totals = response.json()["totals"]
        self.assertEqual(Decimal(totals["income"]), Decimal("3000.00"))
        self.assertEqual(Decimal(totals["expenses"]), Decimal("750.25"))
        self.assertEqual(Decimal(totals["balance"]), Decimal("2249.75"))
        self.assertEqual(len(response.json()["monthly_data"]), 6)

    def test_admin_authorization_and_access_changes(self) -> None:
        admin = self.register("admin@example.com", name="Admin User")
        member = self.register("member@example.com", name="Member User")
        admin_headers = self.auth_headers("admin@example.com")
        member_headers = self.auth_headers("member@example.com")

        denied = self.client.get(
            "/api/v1/admin/overview",
            headers=member_headers,
        )
        self.assert_status(denied, 403)

        with TestingSessionLocal() as database:
            admin_user = database.get(User, admin["id"])
            admin_user.is_admin = True
            database.commit()

        overview = self.client.get(
            "/api/v1/admin/overview",
            headers=admin_headers,
        )
        self.assert_status(overview, 200)
        self.assertEqual(overview.json()["user_count"], 2)
        self.assertEqual(overview.json()["admin_count"], 1)

        self_change = self.client.patch(
            f"/api/v1/admin/users/{admin['id']}",
            headers=admin_headers,
            json={"is_admin": False},
        )
        self.assert_status(self_change, 409)

        disable_member = self.client.patch(
            f"/api/v1/admin/users/{member['id']}",
            headers=admin_headers,
            json={"is_active": False},
        )
        self.assert_status(disable_member, 200)
        self.assertFalse(disable_member.json()["is_active"])

        disabled_request = self.client.get(
            "/api/v1/auth/me",
            headers=member_headers,
        )
        self.assert_status(disabled_request, 403)

    def test_invalid_transaction_returns_validation_details(self) -> None:
        self.register("validation@example.com")
        headers = self.auth_headers("validation@example.com")

        response = self.client.post(
            "/api/v1/transactions/",
            headers=headers,
            json={
                "title": "X",
                "amount": 0,
                "transaction_type": "unknown",
                "category": "F",
                "transaction_date": "not-a-date",
            },
        )
        self.assert_status(response, 422)
        self.assertEqual(
            response.json()["message"],
            "Please check the submitted information.",
        )
        self.assertGreaterEqual(len(response.json()["errors"]), 4)


if __name__ == "__main__":
    unittest.main()
