import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";

// Dynamic import for Recharts (no SSR)
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), {
  ssr: false,
});
const Line = dynamic(() => import("recharts").then((m) => m.Line), {
  ssr: false,
});
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), {
  ssr: false,
});
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), {
  ssr: false,
});
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), {
  ssr: false,
});
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false },
);
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), {
  ssr: false,
});
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false },
);

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [insights, setInsights] = useState("");
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Supabase-driven state
  const [availableMonths, setAvailableMonths] = useState([]);
  const [posts, setPosts] = useState([]);
  const [prevPosts, setPrevPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      localStorage.getItem("foradam_auth") === "true"
    ) {
      setAuthenticated(true);
    }
  }, []);

  // Fetch available months on auth
  useEffect(() => {
    if (!authenticated) return;
    fetch("/api/posts")
      .then((r) => r.json())
      .then(({ availableMonths }) => {
        setAvailableMonths(availableMonths || []);
        if (availableMonths && availableMonths.length > 0) {
          setSelectedMonth(availableMonths[0]);
        }
      })
      .catch(() => {});
  }, [authenticated]);

  // Fetch posts for selected month
  useEffect(() => {
    if (!selectedMonth) return;
    setPostsLoading(true);
    fetch(`/api/posts?year=${selectedMonth.year}&month=${selectedMonth.month}`)
      .then((r) => r.json())
      .then(({ posts }) => {
        setPosts(posts || []);
        setPostsLoading(false);
      })
      .catch(() => setPostsLoading(false));
  }, [selectedMonth]);

  // Fetch previous month posts for delta
  useEffect(() => {
    if (!selectedMonth) return;
    let pm = selectedMonth.month - 1;
    let py = selectedMonth.year;
    if (pm === 0) {
      pm = 12;
      py--;
    }
    fetch(`/api/posts?year=${py}&month=${pm}`)
      .then((r) => r.json())
      .then(({ posts }) => setPrevPosts(posts || []))
      .catch(() => setPrevPosts([]));
  }, [selectedMonth]);

  // Metrics
  const metrics = useMemo(() => {
    if (posts.length === 0)
      return {
        totalViews: 0,
        avgReach: 0,
        avgEngagementRate: 0,
        totalPosts: 0,
      };
    const totalViews = posts.reduce((s, p) => s + p.views, 0);
    const avgReach = Math.round(
      posts.reduce((s, p) => s + p.reach, 0) / posts.length,
    );
    const totalEngagement = posts.reduce(
      (s, p) => s + p.likes + p.comments + p.shares + p.saves,
      0,
    );
    const avgEngagementRate =
      totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(2) : 0;
    return {
      totalViews,
      avgReach,
      avgEngagementRate: Number(avgEngagementRate),
      totalPosts: posts.length,
    };
  }, [posts]);

  const prevMetrics = useMemo(() => {
    if (prevPosts.length === 0) return null;
    const totalViews = prevPosts.reduce((s, p) => s + p.views, 0);
    const avgReach = Math.round(
      prevPosts.reduce((s, p) => s + p.reach, 0) / prevPosts.length,
    );
    const totalEngagement = prevPosts.reduce(
      (s, p) => s + p.likes + p.comments + p.shares + p.saves,
      0,
    );
    const avgEngagementRate =
      totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(2) : 0;
    return {
      totalViews,
      avgReach,
      avgEngagementRate: Number(avgEngagementRate),
      totalPosts: prevPosts.length,
    };
  }, [prevPosts]);

  // Chart data — weekly views
  const weeklyData = useMemo(() => {
    if (!selectedMonth || posts.length === 0) return [];
    const weeks = [{}, {}, {}, {}];
    posts.forEach((p) => {
      const day = new Date(p.posted_at).getDate();
      const weekIdx = Math.min(Math.floor((day - 1) / 7), 3);
      if (!weeks[weekIdx].tiktok)
        weeks[weekIdx] = {
          week: `Week ${weekIdx + 1}`,
          tiktok: 0,
          instagram: 0,
        };
      if (p.platform === "tiktok") weeks[weekIdx].tiktok += p.views;
      else weeks[weekIdx].instagram += p.views;
    });
    return weeks.map((w, i) => ({
      week: `Week ${i + 1}`,
      tiktok: w.tiktok || 0,
      instagram: w.instagram || 0,
    }));
  }, [posts, selectedMonth]);

  // Bar chart — engagement breakdown
  const engagementData = useMemo(() => {
    if (posts.length === 0) return [];
    const tt = posts.filter((p) => p.platform === "tiktok");
    const ig = posts.filter((p) => p.platform === "instagram");
    const sum = (arr, key) => arr.reduce((s, p) => s + p[key], 0);
    return ["likes", "comments", "shares", "saves"].map((key) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      tiktok: sum(tt, key),
      instagram: sum(ig, key),
    }));
  }, [posts]);

  // Donut chart — platform split
  const platformSplit = useMemo(() => {
    if (posts.length === 0) return [];
    const ttViews = posts
      .filter((p) => p.platform === "tiktok")
      .reduce((s, p) => s + p.views, 0);
    const igViews = posts
      .filter((p) => p.platform === "instagram")
      .reduce((s, p) => s + p.views, 0);
    return [
      { name: "TikTok", value: ttViews },
      { name: "Instagram", value: igViews },
    ];
  }, [posts]);

  // Top 5 posts
  const topPosts = useMemo(() => {
    return [...posts].sort((a, b) => b.views - a.views).slice(0, 5);
  }, [posts]);

  // Handlers
  function handleLogin(e) {
    e.preventDefault();
    if (keyInput === process.env.NEXT_PUBLIC_SECRET_KEY) {
      setAuthenticated(true);
      localStorage.setItem("foradam_auth", "true");
      setKeyError("");
    } else {
      setKeyError("Invalid key. Please try again.");
    }
  }

  async function handleSync() {
    setSyncing(true);
    setSyncMessage("");
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: process.env.NEXT_PUBLIC_SECRET_KEY }),
      });
      const data = await res.json();
      setSyncMessage(data.message || "Sync complete");

      // Refresh available months and posts after sync
      const postsRes = await fetch("/api/posts");
      const { availableMonths: newMonths } = await postsRes.json();
      setAvailableMonths(newMonths || []);
      if (newMonths && newMonths.length > 0) {
        const top = newMonths[0];
        setSelectedMonth(top);
      }
    } catch {
      setSyncMessage("Sync failed");
    }
    setSyncing(false);
  }

  async function handleInsights() {
    setInsightsLoading(true);
    setInsights("");
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posts,
          metrics,
          month: selectedMonth ? MONTH_NAMES[selectedMonth.month] : "",
          year: selectedMonth?.year,
        }),
      });
      const data = await res.json();
      setInsights(data.insights || "No insights generated.");
    } catch {
      setInsights("Failed to generate insights.");
    }
    setInsightsLoading(false);
  }

  function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  }

  function getDelta(current, previous) {
    if (!previous || previous === 0) return null;
    const pct = (((current - previous) / previous) * 100).toFixed(1);
    return { value: pct, positive: pct >= 0 };
  }

  // Gate Screen
  if (!authenticated) {
    return (
      <>
        <Head>
          <title>foradam.care Analytics</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="gate">
          <h1>foradam.care</h1>
          <p>Enter your access key to continue</p>
          <form className="gate-input" onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Access key"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn">
              Enter
            </button>
          </form>
          {keyError && <p className="gate-error">{keyError}</p>}
        </div>
      </>
    );
  }

  // Dashboard
  return (
    <>
      <Head>
        <title>foradam.care Analytics</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Top Bar */}
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
            onChange={(e) => {
              const [y, m] = e.target.value.split("-").map(Number);
              setSelectedMonth({ year: y, month: m });
              setInsights("");
            }}
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
          <button className="sync-btn" onClick={handleSync} disabled={syncing}>
            {syncing ? "Syncing..." : "Sync"}
          </button>
        </div>
      </div>

      {syncMessage && (
        <div
          style={{
            textAlign: "center",
            padding: "8px",
            fontSize: "13px",
            color: "#555",
          }}
        >
          {syncMessage}
        </div>
      )}

      <div className="dashboard">
        {postsLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              color: "#999",
              fontSize: "14px",
            }}
          >
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              color: "#999",
              fontSize: "14px",
            }}
          >
            No data for this month. Press <strong>Sync</strong> to fetch posts.
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="metrics">
              {[
                {
                  label: "Total Views",
                  value: metrics.totalViews,
                  prev: prevMetrics?.totalViews,
                  format: true,
                },
                {
                  label: "Avg Reach / Post",
                  value: metrics.avgReach,
                  prev: prevMetrics?.avgReach,
                  format: true,
                },
                {
                  label: "Avg Engagement Rate",
                  value: metrics.avgEngagementRate,
                  prev: prevMetrics?.avgEngagementRate,
                  suffix: "%",
                },
                {
                  label: "Total Posts",
                  value: metrics.totalPosts,
                  prev: prevMetrics?.totalPosts,
                },
              ].map((card) => {
                const delta = getDelta(card.value, card.prev);
                return (
                  <div className="metric-card" key={card.label}>
                    <div className="metric-label">{card.label}</div>
                    <div className="metric-value">
                      {card.format ? formatNumber(card.value) : card.value}
                      {card.suffix || ""}
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
              })}
            </div>

            {/* Charts */}
            <div className="charts">
              {/* Line Chart */}
              <div className="chart-card full">
                <div className="chart-title">
                  Views by Week — TikTok vs Instagram
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatNumber}
                    />
                    <Tooltip formatter={(v) => formatNumber(v)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tiktok"
                      name="TikTok"
                      stroke="#333333"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="instagram"
                      name="Instagram"
                      stroke="#C2185B"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div className="chart-card">
                <div className="chart-title">Engagement Breakdown</div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatNumber}
                    />
                    <Tooltip formatter={(v) => formatNumber(v)} />
                    <Legend />
                    <Bar
                      dataKey="tiktok"
                      name="TikTok"
                      fill="#333333"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="instagram"
                      name="Instagram"
                      fill="#C2185B"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Donut Chart */}
              <div className="chart-card">
                <div className="chart-title">Platform Split — Total Views</div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={platformSplit}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      <Cell fill="#333333" />
                      <Cell fill="#C2185B" />
                    </Pie>
                    <Tooltip formatter={(v) => formatNumber(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Posts */}
            <div className="top-posts">
              <div className="section-title">Top 5 Posts by Views</div>
              {topPosts.map((post) => (
                <div className="post-row" key={post.post_id}>
                  <span className={`platform-pill ${post.platform}`}>
                    {post.platform === "tiktok" ? "TikTok" : "Instagram"}
                  </span>
                  <span className="post-caption">{post.caption}</span>
                  <span className="post-views">{formatNumber(post.views)}</span>
                  <a
                    className="post-link"
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>

            {/* AI Insights */}
            <div className="insights-section">
              <div className="section-title">AI Insights</div>
              <button
                className="btn btn-insights"
                onClick={handleInsights}
                disabled={insightsLoading}
              >
                {insightsLoading ? "Generating..." : "Generate Insights"}
              </button>
              {insights && (
                <div className="insights-content">
                  {insights.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
