'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";
import { format, subDays, startOfDay } from "date-fns";

import Header from "@/components/Header";
import { apiService, Appointment } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const COLORS = [
  "#1d4ed8",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

// ✅ typed and moved outside component
interface TooltipPayloadEntry {
  date?: string;
  name?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: ValueType; payload: TooltipPayloadEntry }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const entry = payload[0].payload as TooltipPayloadEntry;
    return (
      <div className="neumo-sm rounded-xl px-4 py-2">
        <p className="text-sm font-medium text-foreground">
          {entry.date ?? entry.name}
        </p>
        <p className="text-sm text-primary font-semibold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
}

export default function Analytics() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
  let cancelled = false; // ✅ prevents setState on unmounted component

  const load = async () => {
    try {
      // Use date filters to get all appointments for accurate analytics
      const today = new Date();
      const startDate = subDays(today, 13);
      
      const res = await apiService.getDashboard(1, 100, {
        start_date: startDate.toISOString(),
        end_date: today.toISOString()
      });
      if (!cancelled) setAppointments(res.data?.appointments ?? []);
    } catch {
      if (!cancelled) toast({ title: "Failed to load analytics", variant: "destructive" });
    }
  };

  load();

  return () => { cancelled = true; }; // cleanup
}, [toast]);

  // Status distribution
  const statusData = React.useMemo(() => {
    const counts = appointments.reduce<Record<string, number>>((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [appointments]);

  // Appointments per day (last 14 days)
  const dailyData = React.useMemo(() => {
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, "yyyy-MM-dd");
      const count = appointments.filter(
        (a) => format(new Date(a.date_time), "yyyy-MM-dd") === dateStr
      ).length;
      data.push({ date: format(date, "MMM d"), count });
    }
    return data;
  }, [appointments]);

  return (
    <div className="space-y-6">
      <Header />

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-foreground"
      >
        Analytics
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="neumo rounded-2xl p-6"
        >
          <h3 className="text-base font-semibold text-foreground mb-4">
            Daily Trend (14 days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#1d4ed8"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#1d4ed8" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="neumo rounded-2xl p-6"
        >
          <h3 className="text-base font-semibold text-foreground mb-4">
            Status Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </div>
          {statusData.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {statusData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="capitalize text-muted-foreground">{entry.name}</span>
                  <span className="font-medium text-foreground">{entry.value}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}