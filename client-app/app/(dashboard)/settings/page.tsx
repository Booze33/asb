'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { apiService, Admin } from "@/lib/api";
import Header from "@/components/Header";

export default function Settings() {
  const [user, setUser] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const { admin } = useAuth();

  useEffect(() => {
    if (admin) {
      setUser(admin);
      setLoading(false);
    } else {
      // Try to fetch admin profile if not available in auth context
      const fetchAdminProfile = async () => {
        try {
          const response = await apiService.getAdminProfile();
          if (response.success) {
            setUser(response.data);
          }
        } catch (error) {
          console.error('Failed to fetch admin profile:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchAdminProfile();
    }
  }, [admin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-foreground"
      >
        Settings
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="neumo rounded-2xl p-6 max-w-lg"
      >
        <h3 className="text-base font-semibold text-foreground mb-4">Profile</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Full Name
            </Label>
            <div className="neumo-inset rounded-xl px-4 py-2.5 text-sm text-foreground">
              {user?.name || "Not set"}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Email
            </Label>
            <div className="neumo-inset rounded-xl px-4 py-2.5 text-sm text-foreground">
              {user?.email || "Not set"}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Role</Label>
            <div className="neumo-inset rounded-xl px-4 py-2.5 text-sm text-foreground capitalize">
              {user?.role || "user"}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}