import { FormEvent, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const API_BASE_URL = "https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev";
const LOGIN_ENDPOINT = `${API_BASE_URL}/auth`;
const REGISTER_ENDPOINT = `${API_BASE_URL}/register`;

type AuthTab = "login" | "register";

interface LoggedInUser {
  id?: number;
  username: string;
  email: string;
  fullName?: string;
}

const STORAGE_KEY = "showtime_user";
const USERS_STORAGE_KEY = "showtime_users";
const AUTH_CHANGED_EVENT = "auth-changed";

const getSavedUser = (): LoggedInUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LoggedInUser) : null;
  } catch {
    return null;
  }
};

const emitAuthChanged = () => {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

const readUsers = (): LoggedInUser[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LoggedInUser[]) : [];
  } catch {
    return [];
  }
};

const findUserByEmail = (email: string): LoggedInUser | null => {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  return users.find((item) => item.email?.toLowerCase() === normalizedEmail) || null;
};

const upsertUserDirectory = (user: LoggedInUser) => {
  const users = readUsers().filter((item) => item.email !== user.email);
  users.unshift(user);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const safeReadMessage = async (res: Response) => {
  try {
    const data = await res.json();
    return data?.message || "Request failed";
  } catch {
    return "Request failed";
  }
};

export default function AuthPage() {
  const [tab, setTab] = useState<AuthTab>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentUser(getSavedUser());
  }, []);

  useEffect(() => {
    if (currentUser) {
      navigate("/account", { replace: true });
    }
  }, [currentUser, navigate]);

  const buttonText = useMemo(
    () => (tab === "login" ? "Sign In" : "Create Account"),
    [tab],
  );

  const persistUser = (user: LoggedInUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    upsertUserDirectory(user);
    setCurrentUser(user);
    emitAuthChanged();
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
    emitAuthChanged();
    toast({
      title: "Signed out",
      description: "You have been logged out.",
    });
  };

  const handleLogin = async () => {
    const response = await fetch(LOGIN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: email.trim(),
        password,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.message || "Unable to login. Please try again.");
    }

    if (!data?.user) {
      throw new Error(data?.message || "Unable to login. Please try again.");
    }

    const existingUser = findUserByEmail(data.user.email || email.trim());

    persistUser({
      id: Number(data.user.id || data.user.usrID || 0) || undefined,
      username: data.user.username,
      email: data.user.email,
      fullName: data.user.fullName || data.user.usrFullName || existingUser?.fullName,
    });

    toast({
      title: "Login successful",
      description: `Welcome back, ${data.user.email}`,
    });

    navigate("/account");
  };

  const handleRegister = async () => {
    const response = await fetch(REGISTER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.message || "Registration failed.");
    }

    const registeredUser: LoggedInUser = {
      id: Number(data?.user?.id || data?.user?.usrID || 0) || undefined,
      username: data?.user?.username || email.trim().split("@")[0],
      email: data?.user?.email || email.trim(),
      fullName: data?.user?.fullName || data?.user?.fullname || fullName.trim(),
    };

    persistUser(registeredUser);

    toast({
      title: "Registration successful",
      description: "Your account was created.",
    });

    setTab("login");
    setPassword("");
    setConfirmPassword("");
    navigate("/account");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in email and password.",
      });
      return;
    }

    if (tab === "register") {
      if (!fullName.trim()) {
        toast({
          title: "Missing fields",
          description: "Please enter your full name.",
        });
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Weak password",
          description: "Password must be at least 6 characters.",
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Password mismatch",
          description: "Password and confirm password must match.",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (tab === "login") {
        await handleLogin();
      } else {
        await handleRegister();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast({
        title: tab === "login" ? "Login failed" : "Registration failed",
        description: message,
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
          <Ticket className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Show<span className="text-primary">Time</span></span>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-secondary p-1 mb-8">
          <button onClick={() => setTab("login")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Login</button>
          <button onClick={() => setTab("register")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "register" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Register</button>
        </div>

        {currentUser && (
          <div className="mb-6 p-4 rounded-xl bg-secondary border border-border">
            <p className="text-sm font-medium">Signed in as {currentUser.email}</p>
            <button
              onClick={handleLogout}
              className="text-xs text-primary mt-2 hover:underline"
            >
              Sign out
            </button>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {tab === "register" && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
              placeholder="you@email.com"
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
              autoComplete={tab === "login" ? "current-password" : "new-password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-8 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {tab === "register" && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Please wait..." : buttonText}
          </button>

        </form>
      </div>
    </div>
  );
}
