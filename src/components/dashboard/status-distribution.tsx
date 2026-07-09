/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_META } from "@/lib/constants/display";

interface StatusDistributionProps {
  data: Array<{ name: string; value: number }>;
}

export function StatusDistribution({ data }: StatusDistributionProps) {
  // Sort data so OPEN/IN_PROGRESS are first, matching typical mental models
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any, name: any) => [
    value,
    STATUS_META[name as keyof typeof STATUS_META]?.label ?? String(name),
  ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legendFormatter = (value: any) => STATUS_META[value as keyof typeof STATUS_META]?.label ?? String(value);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-base">Tickets by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sortedData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {sortedData.map((entry, index) => {
                  const meta = STATUS_META[entry.name as keyof typeof STATUS_META];
                  // Using an array of nice colors for statuses if meta doesn't provide a hex
                  const colors = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#64748b"];
                  const color = meta?.color === "blue" ? "#3b82f6" 
                              : meta?.color === "yellow" ? "#f59e0b"
                              : meta?.color === "green" ? "#10b981"
                              : meta?.color === "slate" ? "#64748b"
                              : colors[index % colors.length];
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-background)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  fontSize: "13px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "var(--color-foreground)" }}
                formatter={tooltipFormatter as any}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
                formatter={legendFormatter as any}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
