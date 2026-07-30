"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Report } from "@/lib/types";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/constants";

export function StatsCharts({ reports }: { reports: Report[] }) {
  const categoryData = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    label,
    value: reports.filter((r) => r.category === key).length,
    color: CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS],
  }));

  const statusData = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    label,
    value: reports.filter((r) => r.status === key).length,
    color: STATUS_COLORS[key as keyof typeof STATUS_COLORS],
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Laporan per Kategori</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {categoryData.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Distribusi Status</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="label"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
            >
              {statusData.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Pie>
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
