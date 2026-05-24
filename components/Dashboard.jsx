import { MONTH_NAMES } from "@/lib/constants";
import { useInsights } from "@/hooks/useInsights";
import { useMetrics } from "@/hooks/useMetrics";
import { usePosts } from "@/hooks/usePosts";
import { useSync } from "@/hooks/useSync";
import EngagementBreakdown from "./charts/EngagementBreakdown";
import PlatformSplit from "./charts/PlatformSplit";
import WeeklyViews from "./charts/WeeklyViews";
import InsightsPanel from "./InsightsPanel";
import MetricCard from "./MetricCard";
import TopPosts from "./TopPosts";

export default function Dashboard() {
  const {
    availableMonths,
    selectedMonth,
    setSelectedMonth,
    posts,
    prevPosts,
    postsLoading,
    refresh,
  } = usePosts(true);

  const {
    metrics,
    prevMetrics,
    weeklyData,
    engagementData,
    platformSplit,
    topPosts,
  } = useMetrics(posts, prevPosts);

  const insights = useInsights();
  const { sync, syncing, message: syncMessage } = useSync(async () => {
    const months = await refresh();
    if (months.length > 0) setSelectedMonth(months[0]);
  });

  function handleMonthChange(e) {
    const [y, m] = e.target.value.split("-").map(Number);
    setSelectedMonth({ year: y, month: m });
    insights.clear();
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>foradam.care</h1>
        </div>
        <div className="topbar-right">
          <select
            className="month-select"
            value={
              selectedMonth
                ? `${selectedMonth.year}-${selectedMonth.month}`
                : ""
            }
            onChange={handleMonthChange}
          >
            {availableMonths.length === 0 && (
              <option disabled value="">
                No data yet — press Sync
              </option>
            )}
            {availableMonths.map((m) => (
              <option
                key={`${m.year}-${m.month}`}
                value={`${m.year}-${m.month}`}
              >
                {MONTH_NAMES[m.month]} {m.year}
              </option>
            ))}
          </select>
          <button className="sync-btn" onClick={sync} disabled={syncing}>
            {syncing ? "Syncing..." : "Sync"}
          </button>
        </div>
      </div>

      {syncMessage && <div className="sync-message">{syncMessage}</div>}

      <div className="dashboard">
        {postsLoading ? (
          <div className="state-message">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="state-message">
            No data for this month. Press <strong>Sync</strong> to fetch posts.
          </div>
        ) : (
          <>
            <div className="metrics">
              <MetricCard
                label="Total Views"
                value={metrics.totalViews}
                prev={prevMetrics?.totalViews}
                format
              />
              <MetricCard
                label="Avg Reach / Post"
                value={metrics.avgReach}
                prev={prevMetrics?.avgReach}
                format
              />
              <MetricCard
                label="Avg Engagement Rate"
                value={metrics.avgEngagementRate}
                prev={prevMetrics?.avgEngagementRate}
                suffix="%"
              />
              <MetricCard
                label="Total Posts"
                value={metrics.totalPosts}
                prev={prevMetrics?.totalPosts}
              />
            </div>

            <div className="charts">
              <WeeklyViews data={weeklyData} />
              <EngagementBreakdown data={engagementData} />
              <PlatformSplit data={platformSplit} />
            </div>

            <TopPosts posts={topPosts} />

            <InsightsPanel
              insights={insights.insights}
              loading={insights.loading}
              error={insights.error}
              onGenerate={() =>
                insights.generate({ posts, metrics, selectedMonth })
              }
            />
          </>
        )}
      </div>
    </>
  );
}
