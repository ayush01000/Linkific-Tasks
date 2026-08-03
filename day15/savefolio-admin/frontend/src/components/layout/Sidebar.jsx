import { NavLink } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

export default function Sidebar({
  open,
  onClose,
}) {
  const { user } = useAuth();

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

        {user?.is_admin && (
          <>
            <span className="nav-section-label">
              Administration
            </span>

            <NavLink
              to="/admin"
              end
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Admin overview
            </NavLink>

            <NavLink
              to="/admin/users"
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Users
            </NavLink>

            <NavLink
              to="/admin/transactions"
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              All transactions
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
