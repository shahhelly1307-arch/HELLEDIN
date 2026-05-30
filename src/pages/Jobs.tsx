import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Briefcase, MapPin, Bookmark, BookmarkCheck, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNowStrict } from "date-fns";

const CATEGORIES = ["All", "IT", "Computer Science", "Data Science", "AI", "Machine Learning", "Data Engineering", "Cloud", "Cybersecurity", "Full Stack", "DevOps"];

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.from("jobs").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(200).then(({ data }) => {
      setJobs(data ?? []); setSelected((data ?? [])[0] ?? null);
    });
    if (user) {
      supabase.from("saved_jobs").select("job_id").eq("user_id", user.id).then(({ data }) => setSaved(new Set((data ?? []).map((s) => s.job_id))));
      supabase.from("job_applications").select("job_id").eq("candidate_id", user.id).then(({ data }) => setApplied(new Set((data ?? []).map((a) => a.job_id))));
    }
  }, [user]);

  const filtered = useMemo(() => jobs.filter((j) => (cat === "All" || j.category === cat) && (q === "" || `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(q.toLowerCase()))), [jobs, cat, q]);

  const toggleSave = async (jobId: string) => {
    if (!user) return toast.error("Sign in to save jobs");
    const next = new Set(saved);
    if (saved.has(jobId)) { await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", jobId); next.delete(jobId); }
    else { await supabase.from("saved_jobs").insert({ user_id: user.id, job_id: jobId }); next.add(jobId); }
    setSaved(next);
  };

  const apply = async (jobId: string) => {
    if (!user) return toast.error("Sign in to apply");
    const { error } = await supabase.from("job_applications").insert({ job_id: jobId, candidate_id: user.id });
    if (error) return toast.error(error.message);
    setApplied(new Set([...applied, jobId])); toast.success("Application submitted!");
  };

  return (
    <div>
      <div className="glass-card mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jobs, companies, locations…" className="h-10 w-full rounded-md border border-border bg-secondary pl-9 pr-3 text-sm outline-none focus:border-primary" />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${cat === c ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[400px_1fr]">
        <div className="space-y-3 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-2">
          {filtered.map((j) => (
            <motion.button key={j.id} layout onClick={() => setSelected(j)}
              className={`glass-card w-full text-left p-4 transition ${selected?.id === j.id ? "ring-1 ring-primary" : "hover:bg-surface-hover"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{j.title}</h3>
                  <p className="truncate text-sm text-muted-foreground">{j.company}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {j.location}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded bg-secondary px-2 py-0.5 text-[10px]">{j.job_type}</span>
                    <span className="rounded bg-secondary px-2 py-0.5 text-[10px]">{j.category}</span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleSave(j.id); }} className="text-muted-foreground hover:text-primary">
                  {saved.has(j.id) ? <BookmarkCheck className="h-4 w-4 fill-primary text-primary" /> : <Bookmark className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">Posted {formatDistanceToNowStrict(new Date(j.created_at))} ago</div>
            </motion.button>
          ))}
          {filtered.length === 0 && <div className="glass-card p-6 text-center text-sm text-muted-foreground">No jobs found.</div>}
        </div>

        {selected && (
          <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 lg:sticky lg:top-20 lg:self-start">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{selected.title}</h2>
                <p className="mt-1 text-muted-foreground">{selected.company} · {selected.location}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-secondary px-2 py-1">{selected.job_type}</span>
                  <span className="rounded bg-secondary px-2 py-1">{selected.category}</span>
                  {selected.salary_min && <span className="rounded bg-success/15 px-2 py-1 text-success">₹{Math.round(selected.salary_min / 100000)}L–₹{Math.round(selected.salary_max / 100000)}L</span>}
                </div>
              </div>
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-5 flex gap-2">
              {applied.has(selected.id) ? (
                <Button disabled className="flex-1">Applied ✓</Button>
              ) : (
                <Button onClick={() => apply(selected.id)} className="flex-1">Easy Apply</Button>
              )}
              <Button variant="outline" onClick={() => toggleSave(selected.id)}>
                {saved.has(selected.id) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              </Button>
            </div>
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold">About the role</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{selected.description}</p>
            </div>
            {selected.requirements?.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-semibold">Requirements</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">{selected.requirements.map((r: string, i: number) => <li key={i}>• {r}</li>)}</ul>
              </div>
            )}
            {selected.skills?.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-semibold">Skills</h3>
                <div className="flex flex-wrap gap-1.5">{selected.skills.map((s: string) => <span key={s} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">{s}</span>)}</div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
