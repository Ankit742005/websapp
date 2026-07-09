/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRIORITY_META } from "@/lib/constants/display";

interface PriorityChartProps {
  data: Array<{ name: string; value: number }>;
}

export function PriorityChart({ data }: PriorityChartProps) {
  // Sort data by predefined priority rank
  const rank = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 } as Record<string, number>;
  const sortedData = [...data].sort((a, b) => (rank[a.name] ?? 0) - (rank[b.name] ?? 0));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any) => [value, "Tickets"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipLabelFormatter = (label: any) => PRIORITY_META[label as keyof typeof PRIORITY_META]?.label ?? String(label);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-base">Active Tickets by Priority</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} 
                dy={10}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                tickFormatter={(val: any) => PRIORITY_META[val as keyof typeof PRIORITY_META]?.label ?? val}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} 
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: "var(--color-background)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  fontSize: "13px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "var(--color-foreground)" }}
                formatter={tooltipFormatter as any}
                labelFormatter={tooltipLabelFormatter as any}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                {sortedData.map((entry, index) => {
                  const meta = PRIORITY_META[entry.name as keyof typeof PRIORITY_META];
                  const color = meta?.color === "slate" ? "#64748b"
                              : meta?.color === "blue" ? "#3b82f6"
                              : meta?.color === "orange" ? "#f97316"
                              : meta?.color === "red" ? "#ef4444"
                              : "var(--color-primary)";
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
