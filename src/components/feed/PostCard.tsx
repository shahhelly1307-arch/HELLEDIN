import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, MessageSquare, Repeat2, Share2 } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatDistanceToNowStrict } from "date-fns";
import { toast } from "sonner";

export interface PostWithAuthor {
  id: string;
  content: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  created_at: string;
  author?: { id: string; full_name: string; headline: string } | null;
}

export function PostCard({ post }: { post: PostWithAuthor }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");

  const toggleLike = async () => {
    if (!user) return toast.error("Sign in to like posts");
    const next = !liked;
    setLiked(next); setLikes((l) => l + (next ? 1 : -1));
    if (next) await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
    else await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
  };

  const loadComments = async () => {
    setShowComments((v) => !v);
    if (showComments) return;
    const { data } = await supabase.from("post_comments").select("id, content, created_at, user_id, profiles:user_id(full_name)").eq("post_id", post.id).order("created_at", { ascending: false }).limit(20);
    setComments(data ?? []);
  };

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;
    const { data, error } = await supabase.from("post_comments").insert({ post_id: post.id, user_id: user.id, content: commentText }).select("id, content, created_at, user_id, profiles:user_id(full_name)").single();
    if (error) return toast.error(error.message);
    setComments((c) => [data, ...c]); setCommentText("");
  };

  return (
    <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <Avatar name={post.author?.full_name} seed={post.author?.id} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold leading-tight">{post.author?.full_name ?? "Unknown"}</div>
          <div className="truncate text-xs text-muted-foreground">{post.author?.headline}</div>
          <div className="text-xs text-muted-foreground">{formatDistanceToNowStrict(new Date(post.created_at))} ago</div>
        </div>
      </div>
      <div className="px-4 pb-3 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</div>
      <div className="flex items-center justify-between border-t border-border px-2 py-1">
        <Action icon={<ThumbsUp className={`h-4 w-4 ${liked ? "fill-primary text-primary animate-like-pop" : ""}`} />} label={`Like · ${likes}`} onClick={toggleLike} active={liked} />
        <Action icon={<MessageSquare className="h-4 w-4" />} label={`Comment · ${post.comments_count + comments.length}`} onClick={loadComments} />
        <Action icon={<Repeat2 className="h-4 w-4" />} label={`Repost · ${post.reposts_count}`} onClick={() => toast.success("Reposted")} />
        <Action icon={<Share2 className="h-4 w-4" />} label="Share" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }} />
      </div>
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border bg-surface/40 px-4 py-3">
            {user && (
              <form onSubmit={addComment} className="mb-3 flex gap-2">
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
              </form>
            )}
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <Avatar name={c.profiles?.full_name} seed={c.user_id} size="xs" />
                  <div className="flex-1 rounded-lg bg-card px-3 py-2">
                    <div className="text-xs font-semibold">{c.profiles?.full_name ?? "User"}</div>
                    <div className="text-sm">{c.content}</div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <div className="text-xs text-muted-foreground">Be the first to comment.</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function Action({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick?: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition hover:bg-surface-hover ${active ? "text-primary" : "text-muted-foreground"}`}>
      {icon}<span className="hidden sm:inline">{label}</span>
    </button>
  );
}
