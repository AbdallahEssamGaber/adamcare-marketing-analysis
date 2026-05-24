export default function InsightsPanel({
  insights,
  loading,
  error,
  onGenerate,
}) {
  return (
    <div className="insights-section">
      <div className="section-title">AI Insights</div>
      <button
        className="btn btn-insights"
        onClick={onGenerate}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Insights"}
      </button>
      {error && <p className="gate-error">{error}</p>}
      {insights && (
        <div className="insights-content">
          {insights.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}
    </div>
  );
}
