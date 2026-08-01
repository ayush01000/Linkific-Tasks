import { NavLink } from "react-router-dom";

export default function Sidebar({
  open,
  onClose,
}) {
  return (
    <aside
      className={`sidebar ${
        open ? "sidebar--open" : ""
      }`}
    >
      <div className="brand">
        <span className="brand__mark">S</span>
        <span>Savefolio</span>
      </div>

      <nav className="sidebar__nav">
        <NavLink
          to="/"
          end
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/transactions"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Transactions
        </NavLink>
      </nav>
    </aside>
  );
}