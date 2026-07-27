export default function Content({ children }) {
  return (
    <main className="mx-auto w-full max-w-[1500px] flex-1 p-5 sm:p-8">
      {children}
    </main>
  );
}