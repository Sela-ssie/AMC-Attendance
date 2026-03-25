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

function tickFormatter(value: string, index: number, total: number) {
  if (total <= 12) return value;
  if (total <= 26) return index % 2 === 0 ? value : "";
  return index % 4 === 0 ? value : "";
}

export default function AttendanceChart({ data }: { data: DataPoint[] }) {
  // All bars have the same height (1); color encodes present/absent
  const chartData = data.map((d) => ({ ...d, value: 1 }));

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-5 mb-4 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-green-500" />
          Present
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-400" />
          Absent
        </span>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
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
          {/* No Y-axis — all bars are the same height, color is the signal */}
          <YAxis hide domain={[0, 1]} />
          <Tooltip
            formatter={(_, __, props) => [
              props.payload.attended === 1 ? "Present" : "Absent",
              "Status",
            ]}
            labelFormatter={(label) => `Sunday ${label}`}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "13px",
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.attended === 1 ? "#22c55e" : "#f87171"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
