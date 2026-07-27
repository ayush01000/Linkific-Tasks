export default function Footer() {
  return (
    <footer className="flex flex-col justify-between gap-2 border-t border-white/10 px-5 py-6 text-xs text-zinc-600 sm:flex-row sm:px-8">
      <p>© {new Date().getFullYear()} Savefolio</p>
      <p>Built with React and FastAPI</p>
    </footer>
  );
}