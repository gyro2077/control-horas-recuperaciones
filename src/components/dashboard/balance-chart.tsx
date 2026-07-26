"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatMinutes } from "@/lib/format-minutes";

export function BalanceChart({
  days,
}: Readonly<{
  days: readonly {
    date: string;
    accumulatedBalanceMinutes: number;
  }[];
}>) {
  const data = days.map((day) => ({
    ...day,
    label: day.date.slice(5).replace("-", "/"),
  }));

  return (
    <div className="h-64 w-full" aria-label="Tendencia del saldo acumulado">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 8, left: -15, bottom: 0 }}
        >
          <defs>
            <linearGradient id="balance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
          />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip
            formatter={(value) => [
              formatMinutes(Number(value)),
              "Saldo acumulado",
            ]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #dfe7e4",
              boxShadow: "0 8px 24px rgba(15,23,42,.08)",
            }}
          />
          <Area
            type="monotone"
            dataKey="accumulatedBalanceMinutes"
            stroke="#0f766e"
            strokeWidth={2.5}
            fill="url(#balance)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
