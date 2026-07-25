import { Landmark, Plus, X } from "lucide-react";

export default function Sidebar({
  open,
  onClose,
  onAdd,
}) {
  function handleAdd() {
    onClose();
    onAdd();
  }

  return (
    <div
      className={`sidebar-backdrop ${open ? "open" : ""}`}
      onMouseDown={onClose}
    >
      <aside
        className="mobile-sidebar"
        aria-hidden={!open}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sidebar-header">
          <a
            href="#overview"
            className="brand"
            onClick={onClose}
          >
            <span className="brand-icon">
              <Landmark size={19} />
            </span>

            Savefolio
          </a>

          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={22} />
          </button>
        </div>

        <nav
          className="sidebar-links"
          aria-label="Mobile navigation"
        >
          <a href="#overview" onClick={onClose}>
            Overview
          </a>

          <a href="#savings" onClick={onClose}>
            Savings
          </a>

          <a href="#transactions" onClick={onClose}>
            Transactions
          </a>
        </nav>

        <button
          type="button"
          className="submit-button sidebar-add-button"
          onClick={handleAdd}
        >
          <Plus size={18} />
          Add transaction
        </button>
      </aside>
    </div>
  );
}