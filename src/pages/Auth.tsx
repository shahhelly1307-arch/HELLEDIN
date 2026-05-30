import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Auth() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  // login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // signup
  const [sEmail, setSEmail] = useState("");
  const [sPass, setSPass] = useState("");
  const [sName, setSName] = useState("");
  const [sRole, setSRole] = useState<"candidate" | "employer">("candidate");

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!"); nav("/feed");
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: sEmail, password: sPass,
      options: { emailRedirectTo: `${window.location.origin}/feed`, data: { full_name: sName, role: sRole } },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. Check your email to confirm.");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-gradient-to-br from-primary/20 via-background to-background p-12 lg:flex">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow font-extrabold text-primary-foreground">H</div>
          <span className="text-xl font-bold tracking-tight">HELLEDIN</span>
        </div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h1 className="max-w-md text-5xl font-extrabold leading-tight">Where talent meets opportunity.</h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">Join thousands of professionals building meaningful careers, finding dream roles, and growing their network.</p>
        </motion.div>
        <div className="text-xs text-muted-foreground">© HELLEDIN — Built for professionals.</div>
      </div>
      <div className="grid place-items-center p-6 sm:p-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow font-extrabold text-primary-foreground">H</div>
            <span className="text-lg font-bold">HELLEDIN</span>
          </div>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Join now</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={signIn} className="mt-6 space-y-4">
                <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div><Label htmlFor="pass">Password</Label><Input id="pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                <Button type="submit" disabled={loading} className="w-full">Sign in</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={signUp} className="mt-6 space-y-4">
                <div><Label htmlFor="sname">Full name</Label><Input id="sname" required value={sName} onChange={(e) => setSName(e.target.value)} /></div>
                <div><Label htmlFor="semail">Email</Label><Input id="semail" type="email" required value={sEmail} onChange={(e) => setSEmail(e.target.value)} /></div>
                <div><Label htmlFor="spass">Password</Label><Input id="spass" type="password" required minLength={6} value={sPass} onChange={(e) => setSPass(e.target.value)} /></div>
                <div>
                  <Label>I'm joining as</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(["candidate", "employer"] as const).map((r) => (
                      <button type="button" key={r} onClick={() => setSRole(r)}
                        className={`rounded-md border px-3 py-2 text-sm capitalize transition ${sRole === r ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full">Create account</Button>
                <p className="text-xs text-muted-foreground">By joining, you agree to HELLEDIN's professional community standards.</p>
              </form>
            </TabsContent>
          </Tabs>
          <Link to="/feed" className="mt-6 block text-center text-xs text-muted-foreground hover:text-foreground">Browse as guest →</Link>
        </motion.div>
      </div>
    </div>
  );
}
