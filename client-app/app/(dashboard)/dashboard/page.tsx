'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { CalendarCheck, CalendarDays, Percent, XCircle } from "lucide-react";
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";

import Header from "@/components/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import AppointmentChart from "@/components/dashboard/AppointmentChart";
import AppointmentTable from "@/components/dashboard/AppointmentTable";
import AppointmentDetailModal from "@/components/modals/AppointmentDetailModal";
import CancelConfirmModal from "@/components/modals/CancelConfirmModal";
import RescheduleModal from "@/components/modals/RescheduleModal";
import { apiService, Appointment } from "@/lib/api";

export default function Dashboard() {
  const { toast } = useToast();

  // ── Data state ──────────────────────────────────────────────────────────
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  // ── Modal state ──────────────────────────────────────────────────────────
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      // Use date filters to get all appointments for accurate stats
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const res = await apiService.getDashboard(1, 100, {
        start_date: startOfMonth.toISOString(),
        end_date: endOfMonth.toISOString()
      });

      setAppointments(res.data?.appointments ?? []);
    } catch {
      toast({ title: "Failed to load appointments", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // ── Shared mutation helper ───────────────────────────────────────────────
  const mutate = useCallback(
    async (id: number, data: { status?: Appointment['status']; date_time?: string }) => {
      setIsMutating(true);
      try {
        await apiService.updateAppointment(id, data);
        // Optimistically update local state instead of re-fetching
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...data } : a))
        );
      } catch {
        toast({ title: "Something went wrong", variant: "destructive" });
        throw new Error("Mutation failed"); // re-throw so callers can bail
      } finally {
        setIsMutating(false);
      }
    },
    [toast]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleConfirm = async (apt: Appointment) => {
    await mutate(apt.id, { status: "confirmed" });
    toast({ title: "Appointment confirmed", description: `${apt.name}'s appointment has been confirmed.` });
  };

  const handleCancelClick = (apt: Appointment) => {
    setCancelTarget(apt);
    setShowCancel(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    await mutate(cancelTarget.id, { status: "cancelled" });
    toast({ title: "Appointment cancelled", description: `${cancelTarget.name}'s appointment has been cancelled.` });
    setShowCancel(false);
    setCancelTarget(null);
  };

  const handleRescheduleClick = (apt: Appointment) => {
    setRescheduleTarget(apt);
    setShowReschedule(true);
  };

  const handleRescheduleSubmit = async (apt: Appointment, newDateTime: string) => {
    await mutate(apt.id, { date_time: newDateTime });
    toast({ title: "Appointment rescheduled", description: `${apt.name}'s appointment has been rescheduled.` });
    setShowReschedule(false);
    setRescheduleTarget(null);
  };

  const handleView = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setShowDetail(true);
  };

  const handleMarkCompleted = async (apt: Appointment) => {
    await mutate(apt.id, { status: "completed" });
    toast({ title: "Marked as completed" });
  };

  const handleMarkMissed = async (apt: Appointment) => {
    await mutate(apt.id, { status: "missed" });
    toast({ title: "Marked as missed" });
  };

  // ── Stats ────────────────────────────────────────────────────────────────
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const todayAppointments = appointments.filter((a) => {
    const d = new Date(a.date_time);
    return d >= todayStart && d <= todayEnd && a.status !== "cancelled";
  });

  const weekAppointments = appointments.filter((a) => {
    const d = new Date(a.date_time);
    return d >= weekStart && d <= weekEnd && a.status !== "cancelled";
  });

  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const totalNonCancelled = appointments.filter((a) => a.status !== "cancelled").length;
  const completionRate = totalNonCancelled > 0
    ? Math.round((completedCount / totalNonCancelled) * 100)
    : 0;

  const cancellationsToday = appointments.filter((a) => {
    const d = new Date(a.date_time);
    return d >= todayStart && d <= todayEnd && a.status === "cancelled";
  }).length;

  const stats = [
    { title: "Today's Appointments", value: todayAppointments.length, icon: CalendarCheck, color: "#1d4ed8", subtitle: "Scheduled for today" },
    { title: "This Week", value: weekAppointments.length, icon: CalendarDays, color: "#10b981", subtitle: "Mon – Sun" },
    { title: "Completion Rate", value: `${completionRate}%`, icon: Percent, color: "#f59e0b", subtitle: "Of all appointments" },
    { title: "Cancellations Today", value: cancellationsToday, icon: XCircle, color: "#ec4899", subtitle: "Cancelled today" },
  ];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <Header />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatsCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      <AppointmentChart appointments={appointments} />

      <AppointmentTable
        appointments={appointments}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onCancel={handleCancelClick}
        onReschedule={handleRescheduleClick}
        onView={handleView}
      />

      <AppointmentDetailModal
        appointment={selectedAppointment}
        open={showDetail}
        onClose={() => setShowDetail(false)}
        onConfirm={handleConfirm}
        onCancel={handleCancelClick}
        onReschedule={handleRescheduleClick}
        onMarkCompleted={handleMarkCompleted}
        onMarkMissed={handleMarkMissed}
      />

      <CancelConfirmModal
        open={showCancel}
        onClose={() => { setShowCancel(false); setCancelTarget(null); }}
        onConfirm={handleCancelConfirm}
        isLoading={isMutating}
        clientName={cancelTarget?.name}
      />

      <RescheduleModal
        appointment={rescheduleTarget}
        open={showReschedule}
        onClose={() => { setShowReschedule(false); setRescheduleTarget(null); }}
        onSubmit={handleRescheduleSubmit}
        isLoading={isMutating}
      />
    </div>
  );
}