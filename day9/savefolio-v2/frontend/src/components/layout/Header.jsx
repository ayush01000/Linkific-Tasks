import { Menu, Plus } from "lucide-react";
import { useLocation } from "react-router-dom";

import { useFinance } from "../../context/FinanceContext";

const pageTitles = {
  "/": "Dashboard",
  "/transactions": "Transactions",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export default function Header({ onMenu }) {
  const location = useLocation();
  const { openCreateForm, settings } = useFinance();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-zinc-950/80 px-5 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenu}
          className="grid size-10 place-items-center rounded-xl border border-white/10 text-zinc-300 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-violet-400">
            Savefolio
          </p>

          <h1 className="text-xl font-bold text-white">
            {pageTitles[location.pathname] || "Savefolio"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <strong className="block text-sm text-white">
            {settings.displayName}
          </strong>

          <span className="text-xs text-zinc-500">
            Personal workspace
          </span>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-violet-100"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">
            Add transaction
          </span>
        </button>
      </div>
    </header>
  );
}