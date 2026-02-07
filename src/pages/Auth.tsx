import { useState } from "react";
import { Eye, EyeOff, Ticket } from "lucide-react";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-elevated animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Ticket className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Show<span className="text-primary">Time</span></span>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-secondary p-1 mb-8">
          <button onClick={() => setTab("login")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Login</button>
          <button onClick={() => setTab("register")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "register" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Register</button>
        </div>

        <div className="space-y-4">
          {tab === "register" && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
              <input className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none" placeholder="John Doe" />
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email</label>
            <input type="email" className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none" placeholder="you@email.com" />
          </div>
          <div className="relative">
            <label className="text-xs text-muted-foreground mb-1 block">Password</label>
            <input type={showPassword ? "text" : "password"} className="w-full h-12 px-4 pr-12 rounded-xl bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none" placeholder="••••••••" />
            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-8 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-lg mt-2">
            {tab === "login" ? "Sign In" : "Create Account"}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 rounded-xl bg-secondary border border-border text-foreground text-sm font-medium hover:bg-surface-hover transition-colors">Google</button>
            <button className="py-3 rounded-xl bg-secondary border border-border text-foreground text-sm font-medium hover:bg-surface-hover transition-colors">Apple</button>
          </div>
        </div>
      </div>
    </div>
  );
}
