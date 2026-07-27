import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-96 place-items-center text-center">
      <div>
        <p className="text-7xl font-bold text-violet-400">
          404
        </p>

        <h2 className="mt-4 text-2xl font-bold">
          Page not found
        </h2>

        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-violet-500 px-5 py-3 font-semibold"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}