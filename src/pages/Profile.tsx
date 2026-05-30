import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapPin, Briefcase, Globe, Github, Linkedin, Pencil, Save, X } from "lucide-react";

export default function Profile() {
  const { user, role } = useAuth();
  const [p, setP] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => { setP(data); setForm(data ?? {}); });
  }, [user]);

  const save = async () => {
    const payload = { ...form, skills: typeof form.skills === "string" ? form.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : form.skills, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("profiles").update(payload).eq("id", user!.id);
    if (error) return toast.error(error.message);
    setP(payload); setEdit(false); toast.success("Profile updated");
  };

  if (!p) return <div className="glass-card h-64 animate-pulse" />;
  const completeness = [p.full_name, p.headline, p.bio, p.location, p.skills?.length].filter(Boolean).length * 20;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <div className="glass-card overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/40 via-primary-glow/30 to-primary/20" />
          <div className="-mt-12 px-6 pb-6">
            <div className="flex items-end justify-between">
              <Avatar name={p.full_name} seed={user?.id} size="xl" className="ring-4 ring-card" />
              <Button size="sm" variant={edit ? "ghost" : "outline"} onClick={() => setEdit((v) => !v)}>
                {edit ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              </Button>
            </div>
            {!edit ? (
              <div className="mt-3">
                <h1 className="text-2xl font-bold">{p.full_name}</h1>
                <p className="text-muted-foreground">{p.headline}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {p.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {p.location}</span>}
                  {p.company && <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {p.company}</span>}
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs capitalize text-primary">{role}</span>
                </div>
                <div className="mt-3 flex gap-3 text-muted-foreground">
                  {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="hover:text-primary"><Globe className="h-4 w-4" /></a>}
                  {p.linkedin_url && <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-primary"><Linkedin className="h-4 w-4" /></a>}
                  {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" className="hover:text-primary"><Github className="h-4 w-4" /></a>}
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2"><Label>Full name</Label><Input value={form.full_name ?? ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label>Headline</Label><Input value={form.headline ?? ""} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></div>
                <div><Label>Location</Label><Input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                <div><Label>Company</Label><Input value={form.company ?? ""} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label>Bio</Label><Textarea rows={3} value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label>Skills (comma separated)</Label><Input value={Array.isArray(form.skills) ? form.skills.join(", ") : form.skills ?? ""} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></div>
                <div><Label>Website</Label><Input value={form.website ?? ""} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
                <div><Label>LinkedIn</Label><Input value={form.linkedin_url ?? ""} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} /></div>
                <div><Label>GitHub</Label><Input value={form.github_url ?? ""} onChange={(e) => setForm({ ...form, github_url: e.target.value })} /></div>
                <div className="sm:col-span-2"><Button onClick={save}><Save className="mr-1.5 h-4 w-4" /> Save changes</Button></div>
              </div>
            )}
          </div>
        </div>

        {p.bio && !edit && <div className="glass-card p-6"><h2 className="mb-2 text-lg font-semibold">About</h2><p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{p.bio}</p></div>}

        {p.skills?.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="mb-3 text-lg font-semibold">Skills</h2>
            <div className="flex flex-wrap gap-2">{p.skills.map((s: string) => <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{s}</span>)}</div>
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="glass-card p-4">
          <h3 className="mb-2 text-sm font-semibold">Profile completeness</h3>
          <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all" style={{ width: `${completeness}%` }} /></div>
          <div className="mt-2 text-xs text-muted-foreground">{completeness}% complete</div>
        </div>
      </aside>
    </div>
  );
}
