import React from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Check, X, Clock, Eye } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { Appointment } from "@/lib/api"; // ✅ single source of truth
import type { Status } from "./StatusBadge";

// ✅ removed local Appointment interface — API type is authoritative

interface AppointmentRowProps {
  appointment: Appointment;
  onConfirm: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onReschedule: (appointment: Appointment) => void;
  onView: (appointment: Appointment) => void;
  index?: number;
}

export default function AppointmentRow({
  appointment,
  onConfirm,
  onCancel,
  onReschedule,
  onView,
  index = 0,
}: AppointmentRowProps) {
  const isPast = new Date(appointment.date_time) < new Date();
  const canConfirm = appointment.status === "pending" && !isPast; // ✅ was "booked"
  const canCancel = (["pending", "confirmed"] as Status[]).includes(appointment.status) && !isPast; // ✅ was "booked"
  const canReschedule = (["pending", "confirmed"] as Status[]).includes(appointment.status); // ✅ was "booked"

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="group"
    >
      <td className="py-3 px-4">
        <div>
          <p className="font-medium text-sm text-foreground">{appointment.client_name}</p>
          <p className="text-xs text-muted-foreground">{appointment.client_email}</p>
        </div>
      </td>
      <td className="py-3 px-4">
        <p className="text-sm text-foreground">
          {format(new Date(appointment.date_time), "MMM d, yyyy")}
        </p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(appointment.date_time), "h:mm a")} · {appointment.duration ?? 30} min
        </p>
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={appointment.status} />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onView(appointment)}
            className="neumo-btn p-1.5 rounded-lg"
            title="View details"
          >
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {canConfirm && (
            <button
              onClick={() => onConfirm(appointment)}
              className="neumo-btn p-1.5 rounded-lg"
              title="Confirm"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          )}
          {canReschedule && (
            <button
              onClick={() => onReschedule(appointment)}
              className="neumo-btn p-1.5 rounded-lg"
              title="Reschedule"
            >
              <Clock className="w-3.5 h-3.5 text-primary" />
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => onCancel(appointment)}
              className="neumo-btn p-1.5 rounded-lg"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5 text-destructive" />
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  );
}