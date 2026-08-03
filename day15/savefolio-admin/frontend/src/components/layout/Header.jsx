import { useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

export default function Header({ onOpenMenu }) {
  const [search, setSearch] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleSearch(event) {
    event.preventDefault();

    const query = search.trim();

    navigate(
      query
        ? `/transactions?search=${encodeURIComponent(query)}`
        : "/transactions",
    );
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="header">
      <button
        type="button"
        className="menu-button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
      >
        ☰
      </button>

      <form
        className="header-search"
        onSubmit={handleSearch}
      >
        <input
          type="search"
          placeholder="Search transactions"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          aria-label="Search transactions"
        />
      </form>

      <div className="header__account">
        {user?.is_admin && (
          <span className="role-badge">Admin</span>
        )}

        <span className="header__username">
          {user?.name}
        </span>

        <button
          type="button"
          className="button button--secondary"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
    </header>
  );
}
