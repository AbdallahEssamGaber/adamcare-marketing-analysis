import { COLORS } from "@/lib/constants";
import { formatNumber } from "@/lib/formatting";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "./recharts";

export default function WeeklyViews({ data }) {
  return (
    <div className="chart-card full">
      <div className="chart-title">Views by Week — TikTok vs Instagram</div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="week" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={formatNumber} />
          <Tooltip formatter={(v) => formatNumber(v)} />
          <Legend />
          <Line
            type="monotone"
            dataKey="tiktok"
            name="TikTok"
            stroke={COLORS.TIKTOK}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="instagram"
            name="Instagram"
            stroke={COLORS.INSTAGRAM}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
