import { useState } from "react";
import { MessageCircle, X, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "./Avatar";

const demo = [
  { name: "Aarav Sharma", last: "Hey, congrats on the new role!", online: true },
  { name: "Priya Patel", last: "Sent you the figma link 🎨", online: true },
  { name: "Rohan Mehta", last: "Let's catch up next week.", online: false },
  { name: "Anika Reddy", last: "Thanks for the referral!", online: true },
];

export function MessagingDock() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-0 right-4 z-30 hidden sm:block">
      <div className="w-80 overflow-hidden rounded-t-xl border border-b-0 border-border bg-card shadow-[var(--shadow-elevated)]">
        <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-2 px-4 py-2.5 hover-lift">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">Messaging</span>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">4</span>
          </div>
          <div className="flex items-center gap-2"><Edit3 className="h-4 w-4 text-muted-foreground" /><X className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-0" : "rotate-45"}`} /></div>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="max-h-80 divide-y divide-border overflow-y-auto">
                {demo.map((c) => (
                  <div key={c.name} className="flex items-center gap-3 px-3 py-2.5 hover-lift">
                    <div className="relative">
                      <Avatar name={c.name} size="sm" />
                      {c.online && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-success" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{c.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{c.last}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
