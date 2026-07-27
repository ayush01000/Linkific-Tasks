import {
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { useFinance } from "../../context/FinanceContext";

export default function Toast() {
  const { toast } = useFinance();

  if (!toast) {
    return null;
  }

  const error = toast.type === "error";
  const Icon = error ? AlertCircle : CheckCircle2;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[70] flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl ${
        error
          ? "border-red-500/20 bg-red-950 text-red-200"
          : "border-emerald-500/20 bg-emerald-950 text-emerald-200"
      }`}
    >
      <Icon size={20} />
      <p className="text-sm">{toast.message}</p>
    </div>
  );
}