import { Link, NavLink, useNavigate } from "react-router-dom";
import { Home, Briefcase, Users, MessageCircle, Bell, Search, LogOut, ShieldCheck, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Avatar } from "./Avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, role, signOut } = useAuth();
  const nav = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).single().then(({ data }) => setProfile(data));
    supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8).then(({ data }) => setNotifs(data ?? []));
  }, [user]);

  const items = [
    { to: "/feed", icon: Home, label: "Home" },
    { to: "/network", icon: Users, label: "Network" },
    { to: "/jobs", icon: Briefcase, label: "Jobs" },
    { to: "/messages", icon: MessageCircle, label: "Messages" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:px-6">
        <Link to="/feed" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow font-extrabold text-primary-foreground">H</div>
          <span className="hidden text-lg font-bold tracking-tight sm:inline">HELLEDIN</span>
        </Link>

        <form onSubmit={(e) => { e.preventDefault(); nav(`/search?q=${encodeURIComponent(query)}`); }} className="relative hidden flex-1 max-w-xs md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search HELLEDIN" className="h-9 w-full rounded-md border border-transparent bg-secondary pl-9 pr-3 text-sm outline-none focus:border-primary" />
        </form>

        <nav className="ml-auto flex items-center gap-1">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex flex-col items-center justify-center px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground ${isActive ? "text-foreground border-b-2 border-primary -mb-px" : ""}`
            }>
              <Icon className="h-5 w-5" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}

          <div className="relative">
            <button onClick={() => setNotifOpen((v) => !v)} className="flex flex-col items-center justify-center px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="hidden sm:inline">Alerts</span>
              {notifs.some((n) => !n.is_read) && <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-destructive" />}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl border border-border bg-popover p-2 shadow-[var(--shadow-elevated)]">
                  <div className="px-3 py-2 text-sm font-semibold">Notifications</div>
                  {notifs.length === 0 && <div className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications yet</div>}
                  {notifs.map((n) => (
                    <div key={n.id} className="rounded-md p-3 text-sm hover-lift">{n.message}</div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {role === "employer" && (
            <NavLink to="/employer" className="hidden flex-col items-center px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground sm:flex">
              <LayoutDashboard className="h-5 w-5" /><span>Manage</span>
            </NavLink>
          )}
          {role === "admin" && (
            <NavLink to="/admin" className="hidden flex-col items-center px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground sm:flex">
              <ShieldCheck className="h-5 w-5" /><span>Admin</span>
            </NavLink>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className="ml-1 outline-none">
              <Avatar name={profile?.full_name ?? user?.email} seed={user?.id} size="sm" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2">
                <div className="text-sm font-semibold">{profile?.full_name ?? user?.email}</div>
                <div className="text-xs capitalize text-muted-foreground">{role ?? ""}</div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => nav("/profile")}>View profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => nav("/jobs/saved")}>Saved jobs</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={async () => { await signOut(); nav("/auth"); }}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
