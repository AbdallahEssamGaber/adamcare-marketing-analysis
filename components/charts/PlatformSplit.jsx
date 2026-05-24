import { COLORS } from "@/lib/constants";
import { formatNumber } from "@/lib/formatting";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "./recharts";

export default function PlatformSplit({ data }) {
  return (
    <div className="chart-card">
      <div className="chart-title">Platform Split — Total Views</div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            <Cell fill={COLORS.TIKTOK} />
            <Cell fill={COLORS.INSTAGRAM} />
          </Pie>
          <Tooltip formatter={(v) => formatNumber(v)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
