import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PostCard, PostWithAuthor } from "@/components/feed/PostCard";
import { Composer } from "@/components/feed/Composer";
import { useAuth } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { Link } from "react-router-dom";
import { TrendingUp, Briefcase, BookOpen } from "lucide-react";

const PAGE = 15;

export default function Feed() {
  const { user } = useAuth();
  const [me, setMe] = useState<any>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [page, setPage] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => setMe(data));
    supabase.from("profiles").select("id, full_name, headline").eq("is_demo", true).limit(5).then(({ data }) => setSuggestions(data ?? []));
  }, [user]);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    const { data } = await supabase.from("posts").select("*, author:author_id(id, full_name, headline)").order("created_at", { ascending: false }).range(p * PAGE, p * PAGE + PAGE - 1);
    if (!data || data.length < PAGE) setDone(true);
    setPosts((prev) => (p === 0 ? data ?? [] : [...prev, ...(data ?? [])]));
    setLoading(false);
  }, []);

  useEffect(() => { load(0); }, [load]);

  useEffect(() => {
    if (!sentinel.current || done) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading) {
        setPage((p) => { const next = p + 1; load(next); return next; });
      }
    });
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [done, loading, load]);

  const trends = ["#AI hits new milestone in healthcare", "#RemoteWork — Companies double down", "#Layoffs ease in Q2 reports", "#OpenSource maintainers in demand", "#DataEngineering salaries rising"];

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr_300px]">
      {/* Left sidebar */}
      <aside className="hidden lg:block">
        <div className="glass-card overflow-hidden sticky top-20">
          <div className="h-16 bg-gradient-to-r from-primary/30 to-primary-glow/30" />
          <div className="-mt-8 px-4 pb-4">
            <Avatar name={me?.full_name ?? user?.email} seed={user?.id} size="lg" className="ring-4 ring-card" />
            <Link to="/profile" className="mt-2 block font-semibold hover:underline">{me?.full_name ?? "Your name"}</Link>
            <p className="text-xs text-muted-foreground">{me?.headline || "Add a headline"}</p>
          </div>
          <div className="border-t border-border px-4 py-3 text-xs">
            <div className="flex justify-between text-muted-foreground"><span>Profile views</span><span className="font-semibold text-primary">128</span></div>
            <div className="mt-1 flex justify-between text-muted-foreground"><span>Connections</span><span className="font-semibold text-primary">{suggestions.length * 12}</span></div>
          </div>
          <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground space-y-2">
            <Link to="/jobs/saved" className="flex items-center gap-2 hover:text-foreground"><Briefcase className="h-4 w-4" /> Saved jobs</Link>
            <Link to="/network" className="flex items-center gap-2 hover:text-foreground"><BookOpen className="h-4 w-4" /> Groups & connections</Link>
          </div>
        </div>
      </aside>

      {/* Center feed */}
      <section className="space-y-4">
        <Composer onPosted={(p) => setPosts((prev) => [{ ...p, author: { id: user!.id, full_name: me?.full_name ?? "You", headline: me?.headline ?? "" } }, ...prev])} />
        {posts.map((p) => <PostCard key={p.id} post={p} />)}
        {loading && <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="glass-card h-48 animate-pulse" />)}</div>}
        <div ref={sentinel} />
        {done && <div className="py-6 text-center text-xs text-muted-foreground">You're all caught up ✨</div>}
      </section>

      {/* Right sidebar */}
      <aside className="hidden lg:block">
        <div className="glass-card p-4 sticky top-20">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><TrendingUp className="h-4 w-4 text-primary" /> HELLEDIN News</div>
          <ul className="space-y-3 text-sm">
            {trends.map((t, i) => (
              <li key={i} className="leading-snug">
                <div className="font-medium">{t}</div>
                <div className="text-[11px] text-muted-foreground">{2 + i}h ago · {1000 + i * 234} readers</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-card mt-4 p-4">
          <div className="mb-3 text-sm font-semibold">People you may know</div>
          <ul className="space-y-3">
            {suggestions.map((s) => (
              <li key={s.id} className="flex items-center gap-3">
                <Avatar name={s.full_name} seed={s.id} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{s.full_name}</div>
                  <div className="truncate text-xs text-muted-foreground">{s.headline}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
