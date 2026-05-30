import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Users } from "lucide-react";
import { toast } from "sonner";

const CATS = ["IT", "Computer Science", "Data Science", "AI", "Machine Learning", "Data Engineering", "Cloud", "Cybersecurity", "Full Stack", "DevOps"];

export default function EmployerDashboard() {
  const { user, role } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [apps, setApps] = useState<Record<string, any[]>>({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ title: "", company: "", location: "", category: CATS[0], job_type: "Full-time", description: "", skills: "" });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("jobs").select("*").eq("employer_id", user.id).order("created_at", { ascending: false });
    setJobs(data ?? []);
    if (data?.length) {
      const ids = data.map((j) => j.id);
      const { data: a } = await supabase.from("job_applications").select("*, candidate:candidate_id(full_name, headline)").in("job_id", ids);
      const grouped: Record<string, any[]> = {};
      (a ?? []).forEach((r) => { (grouped[r.job_id] ||= []).push(r); });
      setApps(grouped);
    }
  };

  useEffect(() => { load(); }, [user]);

  if (role !== "employer" && role !== "admin") return <div className="glass-card p-6 text-center text-sm text-muted-foreground">Employers only. Update your role from sign-up to access.</div>;

  const create = async () => {
    const payload = { ...form, employer_id: user!.id, skills: form.skills.split(",").map((s: string) => s.trim()).filter(Boolean) };
    const { error } = await supabase.from("jobs").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Job posted"); setOpen(false); setForm({ title: "", company: "", location: "", category: CATS[0], job_type: "Full-time", description: "", skills: "" }); load();
  };

  const del = async (id: string) => {
    await supabase.from("jobs").delete().eq("id", id);
    toast.success("Job removed"); load();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employer dashboard</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-1.5 h-4 w-4" /> Post a job</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Post a new job</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
                <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Category</Label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-10 w-full rounded-md border border-border bg-input px-3 text-sm">
                    {CATS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><Label>Type</Label>
                  <select value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value })} className="h-10 w-full rounded-md border border-border bg-input px-3 text-sm">
                    {["Full-time", "Part-time", "Contract", "Internship"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div><Label>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Skills (comma separated)</Label><Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></div>
              <Button onClick={create}>Publish job</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {jobs.map((j) => (
          <div key={j.id} className="glass-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{j.title}</div>
                <div className="text-sm text-muted-foreground">{j.company} · {j.location} · {j.category}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3 w-3" /> {(apps[j.id] ?? []).length} applicants</span>
                <Button size="sm" variant="ghost" onClick={() => del(j.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
            {(apps[j.id] ?? []).length > 0 && (
              <div className="mt-3 border-t border-border pt-3">
                <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Applicants</div>
                <div className="space-y-1">
                  {(apps[j.id] ?? []).map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded p-2 hover-lift">
                      <div><div className="text-sm font-medium">{a.candidate?.full_name}</div><div className="text-xs text-muted-foreground">{a.candidate?.headline}</div></div>
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] capitalize text-primary">{a.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {jobs.length === 0 && <div className="glass-card p-8 text-center text-sm text-muted-foreground">No jobs posted yet. Create your first listing!</div>}
      </div>
    </div>
  );
}
