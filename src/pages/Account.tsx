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

const STORAGE_KEY = "rocktime_user";
const USERS_STORAGE_KEY = "rocktime_users";
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
      <div className="relative w-full max-w-lg p-8 rounded-2xl bg-card border border-border shadow-elevated animate-fade-in">
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
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 pb-2 mt-4 custom-scrollbar">
              {tickets.map((ticket) => (
                <div 
                  key={ticket.bookingID} 
                  className="relative flex flex-col sm:flex-row rounded-2xl overflow-hidden bg-card/60 backdrop-blur-md border border-border/60 shadow-lg group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-out"
                >
                  {/* Left decorative color bar */}
                  <div className={`w-full sm:w-2 ${ticket.bookingStatus === 'Booked' ? 'bg-primary' : 'bg-destructive'} shrink-0`} />

                  {/* Main Ticket Area */}
                  <div className="flex-1 p-6 relative">
                    {/* Background Pattern / Icon */}
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                      <Ticket className="w-32 h-32" />
                    </div>

                    <div className="flex justify-between items-start mb-6 w-full gap-4">
                      <div className="flex-1 min-w-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm ${
                          ticket.bookingStatus === 'Booked' 
                            ? 'bg-primary/20 text-primary border border-primary/30' 
                            : 'bg-destructive/20 text-destructive border border-destructive/30'
                        }`}>
                          {ticket.bookingStatus}
                        </span>
                        <h3 className="font-bold text-xl md:text-2xl text-foreground leading-tight tracking-tight truncate w-full" title={ticket.showTitle}>
                          {ticket.showTitle}
                        </h3>
                      </div>
                      
                      <div className="text-center shrink-0 flex flex-col items-center justify-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-widest mb-1">Seat</p>
                        <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-2 shadow-inner inline-flex items-center justify-center min-w-[4rem]">
                          <span className="text-2xl md:text-3xl font-black text-primary tabular-nums tracking-tight">
                            {ticket.seatNo}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border/30">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Booking Ref</p>
                        <p className="font-mono text-sm font-medium text-foreground/90 tabular-nums">
                          #{ticket.bookingID.toString().padStart(6, '0')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Booked By</p>
                        <p className="text-sm font-medium text-foreground/90 truncate" title={ticket.bookingBy}>
                          {ticket.bookingBy}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Payment</p>
                        <p className="text-sm font-medium text-foreground/90 capitalize truncate" title={ticket.payRef}>
                          {ticket.payMethod} {ticket.payRef && <span className="text-xs text-muted-foreground/70">({ticket.payRef})</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Price</p>
                        <p className="text-sm font-bold text-foreground/90 tabular-nums">
                          ${ticket.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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
