import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { getAdminSession, loginAdmin } from "@/lib/adminAuth";

export default function AdminAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (getAdminSession()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter admin email and password.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await loginAdmin(email, password);

      toast({
        title: "Welcome",
        description: `${session.name} signed in successfully.`,
      });

      navigate("/admin", { replace: true });
    } catch (error) {
      toast({
        title: "Access denied",
        description: error instanceof Error ? error.message : "Invalid admin credentials.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-elevated animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Admin <span className="text-primary">Access</span></span>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
              placeholder="admin@showtime.com"
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <label className="text-xs text-muted-foreground mb-1 block">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 pr-12 rounded-xl bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-8 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Please wait..." : "Sign In as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
