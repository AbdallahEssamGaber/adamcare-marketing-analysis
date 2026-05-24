import { COLORS } from "@/lib/constants";
import { formatNumber } from "@/lib/formatting";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "./recharts";

export default function EngagementBreakdown({ data }) {
  return (
    <div className="chart-card">
      <div className="chart-title">Engagement Breakdown</div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={formatNumber} />
          <Tooltip formatter={(v) => formatNumber(v)} />
          <Legend />
          <Bar
            dataKey="tiktok"
            name="TikTok"
            fill={COLORS.TIKTOK}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="instagram"
            name="Instagram"
            fill={COLORS.INSTAGRAM}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
