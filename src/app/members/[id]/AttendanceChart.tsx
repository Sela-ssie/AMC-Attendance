"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type DataPoint = {
  date: string;
  attended: 0 | 1;
  label: string;
};

// Show fewer x-axis labels when there are many services
function tickFormatter(value: string, index: number, total: number) {
  if (total <= 12) return value;
  if (total <= 26) return index % 2 === 0 ? value : "";
  return index % 4 === 0 ? value : "";
}

export default function AttendanceChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
        barSize={data.length > 26 ? 8 : 14}
      >
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value, index) =>
            tickFormatter(value, index, data.length)
          }
        />
        <YAxis
          domain={[0, 1]}
          ticks={[0, 1]}
          tickFormatter={(v) => (v === 1 ? "Present" : "Absent")}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          width={55}
        />
        <Tooltip
          formatter={(value) => [value === 1 ? "Present" : "Absent", "Status"]}
          labelFormatter={(label) => `Sunday ${label}`}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "13px",
          }}
        />
        <Bar dataKey="attended" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.attended === 1 ? "#22c55e" : "#e5e7eb"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
