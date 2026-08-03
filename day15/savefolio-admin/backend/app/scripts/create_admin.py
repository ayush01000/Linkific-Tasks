import argparse
from getpass import getpass

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create or promote a Savefolio administrator."
    )
    parser.add_argument("--name")
    parser.add_argument("--email")
    parser.add_argument("--password")
    return parser.parse_args()


def main() -> None:
    arguments = parse_arguments()
    name = (arguments.name or input("Full name: ")).strip()
    email = (arguments.email or input("Email: ")).strip().lower()
    password = arguments.password or getpass("Password: ")

    if len(name) < 2:
        raise SystemExit("Name must contain at least 2 characters.")
    if "@" not in email:
        raise SystemExit("Enter a valid email address.")
    if len(password) < 8:
        raise SystemExit("Password must contain at least 8 characters.")

    with SessionLocal() as database:
        user = database.scalar(
            select(User).where(User.email == email)
        )

        if user is None:
            user = User(
                name=name,
                email=email,
                hashed_password=hash_password(password),
                is_admin=True,
                is_active=True,
            )
            database.add(user)
            action = "created"
        else:
            user.name = name
            user.hashed_password = hash_password(password)
            user.is_admin = True
            user.is_active = True
            action = "promoted"

        database.commit()

    print(f"Administrator {email} {action} successfully.")


if __name__ == "__main__":
    main()
