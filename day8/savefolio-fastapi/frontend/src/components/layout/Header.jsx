import { Landmark, Menu, Plus } from "lucide-react";

export default function Header({ onAdd, onMenu }) {
  return (
    <header className="navbar">
      <a href="#overview" className="brand">
        <span className="brand-icon">
          <Landmark size={19} />
        </span>

        Savefolio
      </a>

      <nav className="nav-links" aria-label="Main navigation">
        <a href="#overview">Overview</a>
        <a href="#savings">Savings</a>
        <a href="#transactions">Transactions</a>
      </nav>

      <div className="navbar-actions">
        <button
          type="button"
          className="menu-button"
          onClick={onMenu}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <button
          type="button"
          className="primary-button"
          onClick={onAdd}
        >
          <Plus size={18} />
          Add transaction
        </button>
      </div>
    </header>
  );
}