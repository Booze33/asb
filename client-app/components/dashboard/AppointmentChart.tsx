import React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, addDays, startOfDay } from "date-fns";

interface Appointment {
  date_time: string | Date;
  status: string;
}

interface ChartDataPoint {
  date: string;
  fullDate: string;
  count: number;
}

// ✅ moved outside the component entirely — no longer recreated on every render
interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; payload: ChartDataPoint }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="neumo-sm rounded-xl px-4 py-2">
        <p className="text-sm font-medium text-foreground">
          {payload[0].payload.fullDate}
        </p>
        <p className="text-sm text-primary font-semibold">
          {payload[0].value} appointments
        </p>
      </div>
    );
  }
  return null;
}

export default function AppointmentChart({
  appointments = [],
}: {
  appointments: Appointment[];
}) {
  const chartData = React.useMemo<ChartDataPoint[]>(() => {
    const today = startOfDay(new Date());
    const data: ChartDataPoint[] = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const count = appointments.filter((a) => {
        const aDate = format(new Date(a.date_time), "yyyy-MM-dd");
        return aDate === dateStr && a.status !== "cancelled";
      }).length;

      data.push({
        date: format(date, "EEE"),
        fullDate: format(date, "MMM d"),
        count,
      });
    }

    return data;
  }, [appointments]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="neumo rounded-2xl p-6"
    >
      <h3 className="text-base font-semibold text-foreground mb-4">
        Appointments — Next 7 Days
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={32}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar
              dataKey="count"
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
              opacity={0.9}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}