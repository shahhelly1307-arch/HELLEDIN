import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Briefcase, FileText, Users, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const { role } = useAuth();
  const [stats, setStats] = useState({ jobs: 0, activeJobs: 0, applications: 0, users: 0 });
  const [byCategory, setByCategory] = useState<any[]>([]);
  const [byJob, setByJob] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [{ count: jobs }, { count: activeJobs }, { count: applications }, { count: usersCount }] = await Promise.all([
        supabase.from("jobs").select("*", { count: "exact", head: true }),
        supabase.from("jobs").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("job_applications").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      setStats({ jobs: jobs ?? 0, activeJobs: activeJobs ?? 0, applications: applications ?? 0, users: usersCount ?? 0 });

      const { data: jobsData } = await supabase.from("jobs").select("title, category");
      const catCounts: Record<string, number> = {};
      (jobsData ?? []).forEach((j) => { catCounts[j.category] = (catCounts[j.category] ?? 0) + 1; });
      setByCategory(Object.entries(catCounts).map(([name, value]) => ({ name, value })));

      const { data: appData } = await supabase.from("job_applications").select("job_id, jobs(title)").limit(500);
      const jobCounts: Record<string, { name: string; count: number }> = {};
      (appData ?? []).forEach((a: any) => {
        const t = a.jobs?.title ?? "Unknown";
        jobCounts[t] = jobCounts[t] ?? { name: t, count: 0 }; jobCounts[t].count++;
      });
      setByJob(Object.values(jobCounts).sort((a, b) => b.count - a.count).slice(0, 8));

      const { data: u } = await supabase.from("profiles").select("id, full_name, headline, location, created_at").order("created_at", { ascending: false }).limit(20);
      setUsers(u ?? []);
    })();
  }, []);

  if (role !== "admin") return <div className="glass-card p-6 text-center text-sm text-muted-foreground">Admin access only.</div>;

  const COLORS = ["hsl(var(--primary))", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4", "#ec4899", "#84cc16", "#3b82f6", "#f97316"];

  const cards = [
    { label: "Total jobs", value: stats.jobs, icon: Briefcase },
    { label: "Active jobs", value: stats.activeJobs, icon: Activity },
    { label: "Applications", value: stats.applications, icon: FileText },
    { label: "Users", value: stats.users, icon: Users },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin analytics</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="glass-card p-5">
            <div className="flex items-center justify-between"><div className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</div><c.icon className="h-5 w-5 text-primary" /></div>
            <div className="mt-2 text-3xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Applications per top job</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byJob}><XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} /><YAxis tick={{ fontSize: 10 }} /><Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} /><Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Jobs by category</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart><Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={100}>{byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="mb-4 text-sm font-semibold">Recent users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-xs uppercase text-muted-foreground"><th className="py-2">Name</th><th>Headline</th><th>Location</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover-lift"><td className="py-2 font-medium">{u.full_name}</td><td className="text-muted-foreground">{u.headline}</td><td className="text-muted-foreground">{u.location}</td><td className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
