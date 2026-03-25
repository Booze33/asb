import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Bell, User } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";

interface AdminUser {
  name?: string;
  email?: string;
}

export default function Header() {
  const [user, setUser] = useState<AdminUser | null>(null); // ✅ explicit type
  const { admin, logout } = useAuth();

  useEffect(() => {
    setUser(admin)
  }, [admin]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="neumo rounded-2xl px-6 py-4 flex items-center justify-between"
    >
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          {/* ✅ guard with optional chaining — user can be null on first render */}
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h2>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="neumo-btn p-2.5 rounded-xl relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="neumo-btn p-2 rounded-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              {user?.name && (
                <span className="text-sm font-medium text-foreground hidden sm:block">
                  {user.name}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="neumo border-border/30">
            <DropdownMenuItem className="text-sm">{user?.email}</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive text-sm"
              onClick={() => logout()}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}