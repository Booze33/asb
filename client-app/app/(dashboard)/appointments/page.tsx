'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import Header from "@/components/Header";
import AppointmentTable from "@/components/dashboard/AppointmentTable";
import AppointmentDetailModal from "@/components/modals/AppointmentDetailModal";
import CancelConfirmModal from "@/components/modals/CancelConfirmModal";
import RescheduleModal from "@/components/modals/RescheduleModal";
import CreateAppointmentModal from "@/components/modals/CreateAppointmentModal";
import { apiService, Appointment, CreateAppointmentRequest } from "@/lib/api";

export default function Appointments() {
  const { toast } = useToast();

  // ── Data state ────────────────────────────────────────────────────────────
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiService.getDashboard(1, 100);
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

  // ── Update helper (optimistic) ────────────────────────────────────────────
  const mutate = useCallback(
    async (id: number, data: { status?:Appointment['status'] ; date_time?: string }) => {
      setIsMutating(true);
      try {
        await apiService.updateAppointment(id, data);
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...data } : a))
        );
      } catch {
        toast({ title: "Something went wrong", variant: "destructive" });
        throw new Error("Mutation failed");
      } finally {
        setIsMutating(false);
      }
    },
    [toast]
  );

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = useCallback(
    async (data: CreateAppointmentRequest) => {
      setIsCreating(true);
      try {
        const res = await apiService.createAppointment(data);
        // Append the new appointment locally — no re-fetch needed
        setAppointments((prev) => [...prev, res.data]);
        toast({ title: "Appointment created" });
        setShowCreate(false);
      } catch {
        toast({ title: "Failed to create appointment", variant: "destructive" });
      } finally {
        setIsCreating(false);
      }
    },
    [toast]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleConfirm = async (apt: Appointment) => {
    await mutate(apt.id, { status: "confirmed" });
    toast({ title: "Appointment confirmed" });
  };

  const handleCancelClick = (apt: Appointment) => {
    setCancelTarget(apt);
    setShowCancel(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    await mutate(cancelTarget.id, { status: "cancelled" });
    toast({ title: "Appointment cancelled" });
    setShowCancel(false);
    setCancelTarget(null);
  };

  const handleRescheduleClick = (apt: Appointment) => {
    setRescheduleTarget(apt);
    setShowReschedule(true);
  };

  const handleRescheduleSubmit = async (apt: Appointment, newDateTime: string) => {
    await mutate(apt.id, { date_time: newDateTime });
    toast({ title: "Appointment rescheduled" });
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <Header />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold text-foreground">All Appointments</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="neumo-btn px-4 py-2.5 rounded-xl text-sm font-medium text-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Appointment
        </button>
      </motion.div>

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
        clientName={cancelTarget?.client_name}
      />

      <RescheduleModal
        appointment={rescheduleTarget}
        open={showReschedule}
        onClose={() => { setShowReschedule(false); setRescheduleTarget(null); }}
        onSubmit={handleRescheduleSubmit}
        isLoading={isMutating}
      />

      <CreateAppointmentModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />
    </div>
  );
}