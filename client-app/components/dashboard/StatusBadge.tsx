import React from "react";

const statusConfig = {
  pending: {                              // ✅ was "booked"
    label: "Pending",
    className: "neumo-sm text-blue-600",
  },
  confirmed: {
    label: "Confirmed",
    className: "neumo-inset text-emerald-600",
  },
  cancelled: {
    label: "Cancelled",
    className: "neumo-inset text-red-500",
  },
  completed: {
    label: "Completed",
    className: "neumo-sm text-muted-foreground",
  },
  missed: {
    label: "Missed",
    className: "neumo-inset text-amber-600",
  },
} as const;

export type Status = keyof typeof statusConfig;
// now correctly: "pending" | "confirmed" | "cancelled" | "completed" | "missed"

export default function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] ?? statusConfig.pending; // ✅ fallback was "booked"

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}