import dynamic from "next/dynamic";

const load = (name) =>
  dynamic(() => import("recharts").then((m) => m[name]), { ssr: false });

export const LineChart = load("LineChart");
export const Line = load("Line");
export const BarChart = load("BarChart");
export const Bar = load("Bar");
export const PieChart = load("PieChart");
export const Pie = load("Pie");
export const Cell = load("Cell");
export const XAxis = load("XAxis");
export const YAxis = load("YAxis");
export const CartesianGrid = load("CartesianGrid");
export const Tooltip = load("Tooltip");
export const Legend = load("Legend");
export const ResponsiveContainer = load("ResponsiveContainer");
