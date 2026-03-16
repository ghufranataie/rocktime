import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ticket, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface LoggedInUser {
  id?: number;
  username: string;
  email: string;
  fullName?: string;
}

interface UserTicket {
  showID: number;
  showTitle: string;
  bookingID: number;
  bookingBy: string;
  seatNo: number;
  payMethod: string;
  price: string;
  payRef: string;
  bookingStatus: string;
}

const STORAGE_KEY = "showtime_user";
const USERS_STORAGE_KEY = "showtime_users";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev";

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
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
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
      id: saved.id || knownUser?.id,
      fullName: saved.fullName || knownUser?.fullName,
    });
  }, [navigate]);

  useEffect(() => {
    if (!user?.id) return;

    const loadTickets = async () => {
      setLoadingTickets(true);
      try {
        const response = await fetch(`${API_BASE_URL}/tickets?usrID=${user.id}`);
        const data = await response.json().catch(() => ({}));
        setTickets(Array.isArray(data?.body) ? data.body : []);
      } catch {
        setTickets([]);
      } finally {
        setLoadingTickets(false);
      }
    };

    loadTickets();
  }, [user?.id]);

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
          <p className="text-sm text-muted-foreground mt-1">
            User ID: {user.id || "Not available"}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-secondary border border-border mb-6">
          <p className="text-sm font-semibold mb-2">My Tickets</p>
          {loadingTickets && <p className="text-xs text-muted-foreground">Loading tickets...</p>}
          {!loadingTickets && tickets.length === 0 && (
            <p className="text-xs text-muted-foreground">No tickets found for this account.</p>
          )}
          {!loadingTickets && tickets.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {tickets.map((ticket) => (
                <p key={ticket.bookingID} className="text-xs text-muted-foreground">
                  {ticket.showTitle} · Seat {ticket.seatNo} · {ticket.bookingStatus}
                </p>
              ))}
            </div>
          )}
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
