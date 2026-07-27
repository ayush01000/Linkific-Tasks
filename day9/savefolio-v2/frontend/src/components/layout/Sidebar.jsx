import {
  BarChart3,
  LayoutDashboard,
  Landmark,
  Settings,
  WalletCards,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/transactions",
    label: "Transactions",
    icon: WalletCards,
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    to: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function Sidebar({
  open,
  onClose,
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition lg:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onMouseDown={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-zinc-950 p-5 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-violet-500 text-zinc-950">
              <Landmark size={22} />
            </span>

            <div>
              <strong className="block text-lg text-white">
                Savefolio
              </strong>
              <span className="text-xs text-zinc-500">
                Personal finance
              </span>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-xl text-zinc-400 hover:bg-white/5 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-10 space-y-2">
          {navigation.map(
            ({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-500/15"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                {label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="mt-auto rounded-2xl border border-violet-500/15 bg-violet-500/5 p-4">
          <p className="font-semibold text-violet-300">
            Money tip
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Review your transactions weekly to identify
            unnecessary spending.
          </p>
        </div>
      </aside>
    </>
  );
}