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
                <div key={ticket.bookingID} className="relative flex rounded-xl overflow-hidden border border-border bg-card shadow-sm group hover:shadow-md transition-all duration-300">
                  {/* Left side: Main ticket info */}
                  <div className="flex-1 p-5 border-r-2 border-dashed border-border/60 relative bg-gradient-to-br from-card to-secondary/30">
                    {/* Semi-circle cutouts (top & bottom) on the tear line */}
                    <div className="absolute top-[-10px] right-[-10px] h-5 w-5 rounded-full bg-secondary border border-border/40 shadow-inner z-10" />
                    <div className="absolute bottom-[-10px] right-[-10px] h-5 w-5 rounded-full bg-secondary border border-border/40 shadow-inner z-10" />
                    
                    <div className="flex gap-4 items-start mb-2">
                      <h3 className="font-bold text-foreground text-lg leading-tight truncate flex-1" title={ticket.showTitle}>
                        {ticket.showTitle}
                      </h3>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider h-fit border ${
                        ticket.bookingStatus === 'Booked' 
                          ? 'bg-primary/10 text-primary border-primary/20' 
                          : 'bg-destructive/10 text-destructive border-destructive/20'
                      }`}>
                        {ticket.bookingStatus}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-6 text-sm">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Booking Ref</p>
                        <p className="font-mono text-foreground/80 text-xs py-1 px-2 bg-background/50 rounded-md border border-border/50 w-fit">
                          #{ticket.bookingID.toString().padStart(6, '0')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Booked By</p>
                        <p className="text-foreground/90 text-xs truncate font-medium max-w-[120px]" title={ticket.bookingBy}>
                          {ticket.bookingBy}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right side: Tear-off Stub */}
                  <div className="w-28 bg-primary/[0.03] p-4 flex flex-col justify-center items-center text-center relative border-l border-primary/10">
                     <p className="text-[10px] text-primary/70 uppercase font-black tracking-[0.2em] mb-1">Seat</p>
                     <p className="text-4xl font-black text-primary drop-shadow-sm">{ticket.seatNo}</p>
                     
                     <div className="mt-4 pt-3 border-t border-primary/10 w-full">
                       <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{ticket.payMethod}</p>
                       <p className="text-sm font-black text-foreground/80 mt-0.5">${ticket.price}</p>
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
