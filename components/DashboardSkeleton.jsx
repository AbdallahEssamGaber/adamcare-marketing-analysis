import Skeleton from "./Skeleton";

function MetricCardSkeleton() {
  return (
    <div className="metric-card">
      <Skeleton width="60%" height={10} />
      <div style={{ height: 12 }} />
      <Skeleton width="50%" height={28} />
      <div style={{ height: 8 }} />
      <Skeleton width="70%" height={10} />
    </div>
  );
}

function ChartCardSkeleton({ full }) {
  return (
    <div className={`chart-card${full ? " full" : ""}`}>
      <Skeleton width={160} height={10} />
      <div style={{ height: 24 }} />
      <Skeleton width="100%" height={240} radius={6} />
    </div>
  );
}

function PostRowSkeleton() {
  return (
    <div className="post-row">
      <Skeleton width={64} height={18} radius={4} />
      <span className="post-caption">
        <Skeleton width="80%" height={14} />
      </span>
      <Skeleton width={48} height={14} />
      <Skeleton width={36} height={14} />
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="dashboard skeleton-root">
      <div className="metrics">
        {[0, 1, 2, 3].map((i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      <div className="charts">
        <ChartCardSkeleton full />
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>

      <div className="top-posts">
        <Skeleton width={140} height={10} />
        <div style={{ height: 12 }} />
        {[0, 1, 2, 3, 4].map((i) => (
          <PostRowSkeleton key={i} />
        ))}
      </div>

      <div className="insights-section">
        <Skeleton width={140} height={10} />
        <div style={{ height: 12 }} />
        <Skeleton width={160} height={36} radius={6} />
      </div>
    </div>
  );
}
