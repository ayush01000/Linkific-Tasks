export default function LoadingState() {
  return (
    <div className="grid min-h-80 place-items-center">
      <div className="text-center">
        <div className="mx-auto size-10 animate-spin rounded-full border-4 border-zinc-800 border-t-violet-500" />
        <p className="mt-4 text-sm text-zinc-500">
          Loading your finances...
        </p>
      </div>
    </div>
  );
}   