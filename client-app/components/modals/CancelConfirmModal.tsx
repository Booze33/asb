import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface CancelConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  clientName?: string;
}

export default function CancelConfirmModal({ open, onClose, onConfirm, isLoading, clientName }: CancelConfirmModalProps) {
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
            className="neumo rounded-3xl p-6 w-full max-w-sm text-center"
          >
            <div className="neumo-inset w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Cancel Appointment?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to cancel{clientName ? ` ${clientName}'s` : " this"} appointment? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="neumo-btn flex-1 py-2.5 rounded-xl text-sm font-medium text-foreground"
              >
                No, go back
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-destructive text-destructive-foreground neumo-btn disabled:opacity-50"
              >
                {isLoading ? "Cancelling..." : "Yes, cancel"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}