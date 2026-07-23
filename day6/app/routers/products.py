from fastapi import APIRouter, HTTPException, Query, Response, status

from app.schemas import Product, ProductCreate, ProductReplace, ProductUpdate


router = APIRouter(prefix="/products", tags=["Products"])

products: dict[int, Product] = {
    1: Product(
        id=1,
        name="Laptop",
        description="Development laptop",
        price=65000,
        quantity=5,
    ),
    2: Product(
        id=2,
        name="Wireless Mouse",
        description="Ergonomic wireless mouse",
        price=1200,
        quantity=20,
    ),
}
next_product_id = 3


def find_product(product_id: int) -> Product:
    product = products.get(product_id)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return product


@router.get("", response_model=list[Product])
def list_products(
    search: str | None = Query(default=None, min_length=1),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
) -> list[Product]:
    product_list = list(products.values())

    if search:
        search_text = search.casefold()
        product_list = [
            product
            for product in product_list
            if search_text in product.name.casefold()
        ]

    return product_list[skip : skip + limit]


@router.get("/{product_id}", response_model=Product)
def get_product(product_id: int) -> Product:
    return find_product(product_id)


@router.post("", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(product_data: ProductCreate) -> Product:
    global next_product_id

    product = Product(id=next_product_id, **product_data.model_dump())
    products[next_product_id] = product
    next_product_id += 1
    return product


@router.put("/{product_id}", response_model=Product)
def replace_product(
    product_id: int,
    product_data: ProductReplace,
) -> Product:
    find_product(product_id)
    product = Product(id=product_id, **product_data.model_dump())
    products[product_id] = product
    return product


@router.patch("/{product_id}", response_model=Product)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
) -> Product:
    stored_product = find_product(product_id)
    changes = product_data.model_dump(exclude_unset=True)
    updated_product = stored_product.model_copy(update=changes)
    products[product_id] = updated_product
    return updated_product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int) -> Response:
    find_product(product_id)
    del products[product_id]
    return Response(status_code=status.HTTP_204_NO_CONTENT)

