from contextlib import asynccontextmanager
import sqlite3
from pathlib import Path

from fastapi import FastAPI, HTTPException, Response, status
from pydantic import BaseModel, ConfigDict, Field


DATABASE_PATH = Path(__file__).with_name("items.db")


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def create_tables() -> None:
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL CHECK (price >= 0)
            )
            """
        )


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_tables()
    yield


app = FastAPI(
    title="Items CRUD API",
    description="A beginner-friendly CRUD API built with FastAPI and SQLite.",
    version="1.0.0",
    lifespan=lifespan,
)


class ItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    price: float = Field(ge=0)


class ItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    price: float | None = Field(default=None, ge=0)


class Item(ItemCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


def row_to_item(row: sqlite3.Row) -> Item:
    return Item(**dict(row))


@app.get("/")
def home() -> dict[str, str]:
    return {"message": "Items CRUD API is running", "docs": "/docs"}


@app.post("/items", response_model=Item, status_code=status.HTTP_201_CREATED)
def create_item(item: ItemCreate) -> Item:
    with get_connection() as connection:
        cursor = connection.execute(
            "INSERT INTO items (name, description, price) VALUES (?, ?, ?)",
            (item.name, item.description, item.price),
        )
        row = connection.execute(
            "SELECT * FROM items WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
    return row_to_item(row)


@app.get("/items", response_model=list[Item])
def list_items() -> list[Item]:
    with get_connection() as connection:
        rows = connection.execute("SELECT * FROM items ORDER BY id").fetchall()
    return [row_to_item(row) for row in rows]


@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id: int) -> Item:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM items WHERE id = ?", (item_id,)
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return row_to_item(row)


@app.patch("/items/{item_id}", response_model=Item)
def update_item(item_id: int, item: ItemUpdate) -> Item:
    changes = item.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail="No fields supplied")

    with get_connection() as connection:
        existing = connection.execute(
            "SELECT id FROM items WHERE id = ?", (item_id,)
        ).fetchone()
        if existing is None:
            raise HTTPException(status_code=404, detail="Item not found")

        assignments = ", ".join(f"{field} = ?" for field in changes)
        values = [*changes.values(), item_id]
        connection.execute(
            f"UPDATE items SET {assignments} WHERE id = ?", values
        )
        row = connection.execute(
            "SELECT * FROM items WHERE id = ?", (item_id,)
        ).fetchone()
    return row_to_item(row)


@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int) -> Response:
    with get_connection() as connection:
        cursor = connection.execute("DELETE FROM items WHERE id = ?", (item_id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
