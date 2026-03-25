import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "Appointments", path: "/appointments" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar({ collapsed, setCollapsed }: {collapsed: boolean, setCollapsed: React.Dispatch<React.SetStateAction<boolean>> }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col neumo border-r border-border/30"
    >
      {/* Logo area */}
      <div className="flex items-center justify-between p-4 h-16">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground text-lg">BookIt</span>
          </motion.div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="neumo-btn p-2 rounded-lg"
        >
          {collapsed ? (
            <Menu className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${isActive
                  ? "neumo-inset text-primary font-medium"
                  : "hover:neumo-sm text-muted-foreground hover:text-foreground"
                }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border/30">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-muted-foreground hover:text-destructive transition-colors neumo-btn"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}