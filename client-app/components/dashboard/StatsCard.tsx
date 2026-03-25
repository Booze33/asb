import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  index = 0,
}: {
  title: string;
  value: string | number; // ✅ accepts both "72%" and 14
  icon: LucideIcon;
  color: string;
  subtitle: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="neumo rounded-2xl p-5 flex items-start justify-between"
    >
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="neumo-inset p-3 rounded-xl" style={{ color }}>
        <Icon className="w-5 h-5" />
      </div>
    </motion.div>
  );
}