'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppointmentRow from "./AppointmentRow";
import { Appointment } from "@/lib/api";
export type { Appointment }; 
import type { Status } from "./StatusBadge";

const PAGE_SIZE = 8;

interface AppointmentTableProps {
  appointments?: Appointment[];
  onConfirm: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onReschedule: (appointment: Appointment) => void;
  onView: (appointment: Appointment) => void;
  isLoading: boolean;
}

export default function AppointmentTable({
  appointments = [],
  onConfirm,
  onCancel,
  onReschedule,
  onView,
  isLoading,
}: AppointmentTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [page, setPage] = useState(0);

  const filtered = appointments
    .filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (search && !a.client_name?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="neumo rounded-2xl overflow-hidden"
    >
      {/* Filters */}
      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 border-b border-border/30">
        <h3 className="text-base font-semibold text-foreground mr-auto">
          Appointments
        </h3>
        <div className="neumo-inset rounded-xl px-3 py-2 flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search client..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => { setStatusFilter(v as Status | "all"); setPage(0); }}
        >
          <SelectTrigger className="neumo-btn border-0 w-full sm:w-36 rounded-xl">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="neumo border-border/30">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="missed">Missed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Client</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date & Time</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={4} className="py-3 px-4">
                    <div className="h-10 neumo-inset rounded-lg animate-pulse" />
                  </td>
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-muted-foreground text-sm">
                  No appointments found
                </td>
              </tr>
            ) : (
              paginated.map((apt, i) => (
                <AppointmentRow
                  key={apt.id}
                  appointment={apt}
                  index={i}
                  onConfirm={onConfirm}
                  onCancel={onCancel}
                  onReschedule={onReschedule}
                  onView={onView}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages} · {filtered.length} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="neumo-btn p-1.5 rounded-lg disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="neumo-btn p-1.5 rounded-lg disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}