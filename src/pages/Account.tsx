import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ticket, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface LoggedInUser {
  username: string;
  email: string;
  fullName?: string;
}

const STORAGE_KEY = "showtime_user";
const USERS_STORAGE_KEY = "showtime_users";

const getSavedUser = (): LoggedInUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LoggedInUser) : null;
  } catch {
    return null;
  }
};

const getSavedUsers = (): LoggedInUser[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LoggedInUser[]) : [];
  } catch {
    return [];
  }
};

export default function AccountPage() {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const saved = getSavedUser();
    if (!saved) {
      navigate("/auth", { replace: true });
      return;
    }

    const knownUser = getSavedUsers().find(
      (item) => item.email?.toLowerCase() === saved.email?.toLowerCase(),
    );

    setUser({
      ...saved,
      fullName: saved.fullName || knownUser?.fullName,
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("auth-changed"));
    toast({
      title: "Signed out",
      description: "You have been logged out.",
    });
    navigate("/auth", { replace: true });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-elevated animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Ticket className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">My <span className="text-primary">Account</span></span>
        </div>

        <div className="p-4 rounded-xl bg-secondary border border-border mb-6">
          <p className="text-sm text-muted-foreground mb-2">Logged in as</p>
          <p className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            {user.email}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Full Name: {user.fullName || "Not set"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Link
            to="/events"
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-center"
          >
            Browse Events
          </Link>
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl bg-secondary border border-border text-foreground font-semibold"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
