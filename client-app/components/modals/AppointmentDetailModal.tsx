import React from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, MapPin, Clock, Calendar, Check, RotateCcw } from "lucide-react";
import StatusBadge from "../dashboard/StatusBadge";
import { Appointment } from "@/lib/api";

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onReschedule: (appointment: Appointment) => void;
  onMarkCompleted: (appointment: Appointment) => void;
  onMarkMissed: (appointment: Appointment) => void;
}

export default function AppointmentDetailModal({ appointment, open, onClose, onConfirm, onCancel, onReschedule, onMarkCompleted, onMarkMissed }: AppointmentDetailModalProps) {
  if (!appointment) return null;

  const isPast = new Date(appointment.date_time) < new Date();
  const canConfirm = appointment.status === "pending" && !isPast;
  const canCancel = ["booked", "confirmed"].includes(appointment.status) && !isPast;
  const canReschedule = ["booked", "confirmed"].includes(appointment.status);
  const canComplete = appointment.status === "confirmed" && isPast;
  const canMiss = appointment.status === "confirmed" && isPast;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="neumo rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Appointment Details</h2>
              <button onClick={onClose} className="neumo-btn p-2 rounded-xl">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Client info */}
            <div className="neumo-inset rounded-2xl p-4 mb-4 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Client</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{appointment.client_name}</span>
                </div>
                {appointment.client_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{appointment.client_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment info */}
            <div className="neumo-inset rounded-2xl p-4 mb-4 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Appointment</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {format(new Date(appointment.date_time), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {format(new Date(appointment.date_time), "h:mm a")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Duration:</span>
                <span className="text-sm font-medium text-foreground">{appointment.duration || 30} min</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <StatusBadge status={appointment.status} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {canConfirm && (
                <button
                  onClick={() => { onConfirm(appointment); onClose(); }}
                  className="neumo-btn px-4 py-2 rounded-xl text-sm font-medium text-emerald-600 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Confirm
                </button>
              )}
              {canReschedule && (
                <button
                  onClick={() => { onReschedule(appointment); onClose(); }}
                  className="neumo-btn px-4 py-2 rounded-xl text-sm font-medium text-primary flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Reschedule
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => { onCancel(appointment); onClose(); }}
                  className="neumo-btn px-4 py-2 rounded-xl text-sm font-medium text-destructive flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              )}
              {canComplete && (
                <button
                  onClick={() => { onMarkCompleted(appointment); onClose(); }}
                  className="neumo-btn px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Mark Completed
                </button>
              )}
              {canMiss && (
                <button
                  onClick={() => { onMarkMissed(appointment); onClose(); }}
                  className="neumo-btn px-4 py-2 rounded-xl text-sm font-medium text-amber-600 flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Mark Missed
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}