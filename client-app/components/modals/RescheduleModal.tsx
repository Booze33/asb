import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, User, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Appointment } from "@/lib/api";

interface RescheduleModalProps {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (appointment: Appointment, newDateTime: string) => void;
  isLoading: boolean;
}

export default function RescheduleModal({ appointment, open, onClose, onSubmit, isLoading }: RescheduleModalProps) {
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (appointment) {
      const dt = new Date(appointment.date_time);
      setNewDate(format(dt, "yyyy-MM-dd"));
      setNewTime(format(dt, "HH:mm"));
      setError("");
    }
  }, [appointment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDateTime = new Date(`${newDate}T${newTime}`);
    if (newDateTime <= new Date()) {
      setError("Please select a future date and time.");
      return;
    }
    setError("");
    if (appointment) {
      onSubmit(appointment, newDateTime.toISOString());
    }
  };

  if (!appointment) return null;

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
            className="neumo rounded-3xl p-6 w-full max-w-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Reschedule Appointment</h2>
              <button onClick={onClose} className="neumo-btn p-2 rounded-xl">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Client Info (read-only) */}
            <div className="neumo-inset rounded-2xl p-4 mb-5 space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{appointment.client_name}</span>
              </div>
              {appointment.client_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{appointment.client_email}</span>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> New Date
                </Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="neumo-inset border-0 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" /> New Time
                </Label>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="neumo-inset border-0 rounded-xl"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-destructive font-medium">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="neumo-btn flex-1 py-2.5 rounded-xl text-sm font-medium text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground neumo-btn disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Reschedule"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}