import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  return <Navigate to={user ? "/feed" : "/auth"} replace />;
}
