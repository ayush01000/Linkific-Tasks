const currency =
  import.meta.env.VITE_CURRENCY ?? "INR";

const locale =
  import.meta.env.VITE_LOCALE ?? "en-IN";

export function formatCurrency(value) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

export function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}