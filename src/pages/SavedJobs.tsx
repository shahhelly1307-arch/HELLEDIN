import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

export default function SavedJobs() {
  const { user } = useAuth();
  const [saved, setSaved] = useState<any[]>([]);
  const [applied, setApplied] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("saved_jobs").select("created_at, jobs(*)").eq("user_id", user.id).then(({ data }) => setSaved(data ?? []));
    supabase.from("job_applications").select("status, created_at, jobs(*)").eq("candidate_id", user.id).then(({ data }) => setApplied(data ?? []));
  }, [user]);

  const Row = ({ job }: { job: any }) => (
    <div className="glass-card flex items-center justify-between p-4">
      <div>
        <div className="font-semibold">{job.title}</div>
        <div className="text-sm text-muted-foreground">{job.company} · {job.location}</div>
      </div>
      <Link to="/jobs" className="text-sm text-primary hover:underline">View</Link>
    </div>
  );

  return (
    <Tabs defaultValue="saved">
      <TabsList><TabsTrigger value="saved">Saved ({saved.length})</TabsTrigger><TabsTrigger value="applied">Applied ({applied.length})</TabsTrigger></TabsList>
      <TabsContent value="saved" className="space-y-3">
        {saved.map((s, i) => s.jobs && <Row key={i} job={s.jobs} />)}
        {saved.length === 0 && <div className="glass-card p-8 text-center text-sm text-muted-foreground">No saved jobs yet.</div>}
      </TabsContent>
      <TabsContent value="applied" className="space-y-3">
        {applied.map((a, i) => a.jobs && (
          <div key={i} className="glass-card flex items-center justify-between p-4">
            <div><div className="font-semibold">{a.jobs.title}</div><div className="text-sm text-muted-foreground">{a.jobs.company}</div></div>
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs capitalize text-primary">{a.status}</span>
          </div>
        ))}
        {applied.length === 0 && <div className="glass-card p-8 text-center text-sm text-muted-foreground">No applications yet.</div>}
      </TabsContent>
    </Tabs>
  );
}
