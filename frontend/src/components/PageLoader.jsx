export default function PageLoader() {
  return (
    <div className="loading" role="status" aria-label="Loading page">
      <div className="loader-spinner" />
      <p>Loading...</p>
    </div>
  );
}
