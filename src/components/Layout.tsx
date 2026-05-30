import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Navbar } from "./Navbar";
import { MessagingDock } from "./MessagingDock";
import { motion } from "framer-motion";

export function ProtectedLayout({ children }: { children?: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return (
    <div className="min-h-screen">
      <Navbar />
      <motion.main initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
        className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
        {children ?? <Outlet />}
      </motion.main>
      <MessagingDock />
    </div>
  );
}
