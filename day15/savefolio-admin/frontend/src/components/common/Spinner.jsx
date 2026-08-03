export default function Spinner() {
  return (
    <div className="loading-state">
      <span className="spinner" aria-hidden="true" />
      <p>Loading your data...</p>
    </div>
  );
}