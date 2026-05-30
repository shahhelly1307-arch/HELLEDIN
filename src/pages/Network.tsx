import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { UserPlus, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Network() {
  const { user } = useAuth();
  const [people, setPeople] = useState<any[]>([]);
  const [connections, setConnections] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.from("profiles").select("id, full_name, headline, location, company").eq("is_demo", true).limit(50).then(({ data }) => setPeople(data ?? []));
    if (user) supabase.from("connections").select("following_id").eq("follower_id", user.id).then(({ data }) => setConnections(new Set((data ?? []).map((c) => c.following_id))));
  }, [user]);

  const connect = async (id: string) => {
    if (!user) return toast.error("Sign in to connect");
    if (connections.has(id)) {
      await supabase.from("connections").delete().eq("follower_id", user.id).eq("following_id", id);
      const n = new Set(connections); n.delete(id); setConnections(n);
    } else {
      const { error } = await supabase.from("connections").insert({ follower_id: user.id, following_id: id });
      if (error) return toast.error(error.message);
      setConnections(new Set([...connections, id])); toast.success("Connection added");
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Grow your network</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="glass-card overflow-hidden">
            <div className="h-16 bg-gradient-to-r from-primary/30 to-primary-glow/30" />
            <div className="-mt-8 flex flex-col items-center px-4 pb-4">
              <Avatar name={p.full_name} seed={p.id} size="lg" className="ring-4 ring-card" />
              <div className="mt-2 text-center">
                <div className="font-semibold">{p.full_name}</div>
                <div className="line-clamp-2 text-xs text-muted-foreground">{p.headline}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{p.location}</div>
              </div>
              <Button size="sm" variant={connections.has(p.id) ? "secondary" : "default"} onClick={() => connect(p.id)} className="mt-3 w-full">
                {connections.has(p.id) ? <><UserCheck className="mr-1.5 h-4 w-4" /> Connected</> : <><UserPlus className="mr-1.5 h-4 w-4" /> Connect</>}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
