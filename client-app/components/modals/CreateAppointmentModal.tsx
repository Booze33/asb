import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, MapPin, Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateAppointmentRequest } from "@/lib/api";

interface CreateAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAppointmentRequest) => void;
  isLoading: boolean;
}

export default function CreateAppointmentModal({ open, onClose, onSubmit, isLoading }: CreateAppointmentModalProps) {
  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    client_address: "",
    date_time: "",
    time: "",
    duration: 30,
    notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateTime = new Date(`${form.date_time}T${form.time}`);
    onSubmit({
      client_name: form.client_name,
      client_email: form.client_email,
      date_time: dateTime.toISOString(),
      duration: Number(form.duration),
    });
  };

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
            className="neumo rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">New Appointment</h2>
              <button onClick={onClose} className="neumo-btn p-2 rounded-xl">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2"><User className="w-3.5 h-3.5" /> Client Name *</Label>
                <Input value={form.client_name} onChange={(e) => handleChange("client_name", e.target.value)} required className="neumo-inset border-0 rounded-xl" placeholder="John Doe" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email</Label>
                  <Input type="email" value={form.client_email} onChange={(e) => handleChange("client_email", e.target.value)} className="neumo-inset border-0 rounded-xl" placeholder="john@email.com" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> Phone</Label>
                  <Input value={form.client_phone} onChange={(e) => handleChange("client_phone", e.target.value)} className="neumo-inset border-0 rounded-xl" placeholder="+1234567890" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Address</Label>
                <Input value={form.client_address} onChange={(e) => handleChange("client_address", e.target.value)} className="neumo-inset border-0 rounded-xl" placeholder="123 Main St" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Date *</Label>
                  <Input type="date" value={form.date_time} onChange={(e) => handleChange("date_time", e.target.value)} required className="neumo-inset border-0 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Time *</Label>
                  <Input type="time" value={form.time} onChange={(e) => handleChange("time", e.target.value)} required className="neumo-inset border-0 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Duration (minutes)</Label>
                <Input type="number" min={5} value={form.duration} onChange={(e) => handleChange("duration", e.target.value)} className="neumo-inset border-0 rounded-xl" />
              </div>


              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} disabled={isLoading} className="neumo-btn flex-1 py-2.5 rounded-xl text-sm font-medium text-foreground">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground neumo-btn disabled:opacity-50">
                  {isLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}