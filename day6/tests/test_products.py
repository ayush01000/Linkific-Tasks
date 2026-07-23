from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_list_products() -> None:
    response = client.get("/products")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_and_get_product() -> None:
    product_data = {
        "name": "Mechanical Keyboard",
        "description": "Keyboard with blue switches",
        "price": 3499,
        "quantity": 12,
    }

    create_response = client.post("/products", json=product_data)

    assert create_response.status_code == 201
    created_product = create_response.json()
    assert created_product["name"] == product_data["name"]

    get_response = client.get(f"/products/{created_product['id']}")

    assert get_response.status_code == 200
    assert get_response.json() == created_product


def test_invalid_product_is_rejected() -> None:
    response = client.post(
        "/products",
        json={
            "name": "A",
            "description": "Invalid product",
            "price": -10,
            "quantity": -1,
        },
    )

    assert response.status_code == 422


def test_missing_product_returns_404() -> None:
    response = client.get("/products/999999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Product not found"}

