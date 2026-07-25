import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { currency } from "../../utils/currency";

const fallbackChart = [
  { month: "Jan", savings: 0 },
  { month: "Feb", savings: 0 },
  { month: "Mar", savings: 0 },
  { month: "Apr", savings: 0 },
  { month: "May", savings: 0 },
  { month: "Jun", savings: 0 },
];

export default function SavingsChart({ data }) {
  const chartData = data?.length ? data : fallbackChart;

  return (
    <article className="chart-card" id="savings">
      <div className="section-heading">
        <div>
          <p className="eyebrow">GROWTH</p>
          <h2>Savings overview</h2>
        </div>

        <span className="chart-badge">Monthly</span>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="savingGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#9b87f5"
                  stopOpacity={0.5}
                />

                <stop
                  offset="100%"
                  stopColor="#9b87f5"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#28283a"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#85859b",
                fontSize: 12,
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#85859b",
                fontSize: 12,
              }}
            />

            <Tooltip
              formatter={(value) => currency(value)}
              contentStyle={{
                background: "#171721",
                border: "1px solid #303043",
                borderRadius: "12px",
              }}
            />

            <Area
              type="monotone"
              dataKey="savings"
              stroke="#a997ff"
              strokeWidth={3}
              fill="url(#savingGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}