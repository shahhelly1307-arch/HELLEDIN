import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Composer({ onPosted }: { onPosted: (p: any) => void }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const submit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.from("posts").insert({ author_id: user.id, content }).select("*").single();
    setLoading(false);
    if (error) return toast.error(error.message);
    setContent(""); setOpen(false); onPosted(data); toast.success("Posted to your network!");
  };

  return (
    <div className="glass-card p-3">
      <div className="flex items-center gap-3">
        <Avatar seed={user.id} name={user.email} size="sm" />
        <button onClick={() => setOpen(true)} className="flex-1 rounded-full border border-border bg-secondary px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-surface-hover">
          Share an update with your network…
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-2 animate-fade-in">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} autoFocus placeholder="What do you want to talk about?"
            className="w-full rounded-md border border-border bg-card p-3 text-sm outline-none focus:border-primary" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={loading || !content.trim()}>Post</Button>
          </div>
        </div>
      )}
    </div>
  );
}
