import { formatNumber, getDelta } from "@/lib/formatting";

export default function MetricCard({ label, value, prev, format, suffix }) {
  const delta = getDelta(value, prev);
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">
        {format ? formatNumber(value) : value}
        {suffix || ""}
      </div>
      {delta && (
        <div
          className={`metric-delta ${delta.positive ? "positive" : "negative"}`}
        >
          {delta.positive ? "+" : ""}
          {delta.value}% vs last month
        </div>
      )}
    </div>
  );
}
