import { FormEvent, useEffect, useState } from "react";
import { Shield, Users, Ticket, CalendarPlus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { createEventViaApi, fetchEvents, Event } from "@/data/events";
import { getAdminSession, getAdminAuthEventName, logoutAdmin } from "@/lib/adminAuth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev";

interface ApiUser {
  userId?: number;
  username: string;
  fullName?: string;
  email: string;
  usrID?: number;
  usrName?: string;
  usrFullName?: string;
  usrEmail?: string;
  id?: number;
}

interface ApiTicket {
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

type TicketViewMode = "recent" | "show" | "user";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [recentTickets, setRecentTickets] = useState<ApiTicket[]>([]);
  const [ticketDetails, setTicketDetails] = useState<ApiTicket[]>([]);
  const [ticketMode, setTicketMode] = useState<TicketViewMode>("recent");
  const [selectedShowId, setSelectedShowId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    artist: "",
    date: "",
    time: "",
    venue: "",
    city: "",
    price: 50,
    image: "",
    genre: "Concerts",
    description: "",
    rows: 10,
    seatsPerRow: 10,
  });

  const eventCategories = ["Concerts", "Theater", "Comedy"];

  const normalizeUser = (user: ApiUser): ApiUser => ({
    ...user,
    userId: Number(user.userId || user.usrID || user.id || 0) || undefined,
    username: user.username || user.usrName || "unknown",
    fullName: user.fullName || user.usrFullName || "",
    email: user.email || user.usrEmail || "",
  });

  const fetchTickets = async (mode: TicketViewMode, value?: string) => {
    setLoadingTickets(true);
    try {
      const query =
        mode === "show" && value
          ? `?shwID=${value}`
          : mode === "user" && value
            ? `?usrID=${value}`
            : "";

      const response = await fetch(`${API_BASE_URL}/tickets${query}`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load tickets");
      }

      const list = Array.isArray(data?.body) ? data.body : [];
      setTicketDetails(list);
      setTicketMode(mode);
    } catch (error) {
      setTicketDetails([]);
      toast({
        title: "Tickets load failed",
        description: error instanceof Error ? error.message : "Unable to load tickets",
      });
    } finally {
      setLoadingTickets(false);
    }
  };

  const loadData = async () => {
    const [eventsRes, usersRes, ticketsRes] = await Promise.all([
      fetchEvents(),
      fetch(`${API_BASE_URL}/users`),
      fetch(`${API_BASE_URL}/tickets`),
    ]);

    setEvents(eventsRes);

    const usersData = await usersRes.json().catch(() => []);
    const normalizedUsers = Array.isArray(usersData)
      ? usersData.map((item) => normalizeUser(item as ApiUser)).filter((user) => !!user.email)
      : [];
    setUsers(normalizedUsers);

    const ticketsData = await ticketsRes.json().catch(() => ({}));
    const list = Array.isArray(ticketsData?.body) ? ticketsData.body : [];
    setRecentTickets(list);
    setTicketDetails(list);
    setTicketMode("recent");

    if (!selectedShowId && eventsRes.length > 0) {
      setSelectedShowId(eventsRes[0].id);
    }

    if (!selectedUserId && normalizedUsers.length > 0) {
      const firstId = normalizedUsers[0].userId;
      setSelectedUserId(firstId ? String(firstId) : "");
    }
  };

  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      navigate("/admin-auth", { replace: true });
      return;
    }

    setAuthorized(true);
    setAdminName(session.name);

    loadData();

    const reload = () => {
      const currentSession = getAdminSession();
      if (!currentSession) {
        navigate("/admin-auth", { replace: true });
        return;
      }

      setAdminName(currentSession.name);
      loadData();
    };

    window.addEventListener("storage", reload);
    window.addEventListener("auth-changed", reload);
    window.addEventListener(getAdminAuthEventName(), reload);
    return () => {
      window.removeEventListener("storage", reload);
      window.removeEventListener("auth-changed", reload);
      window.removeEventListener(getAdminAuthEventName(), reload);
    };
  }, [navigate]);

  const handleAdminLogout = () => {
    logoutAdmin();
    toast({ title: "Signed out", description: "Admin session closed." });
    navigate("/admin-auth", { replace: true });
  };

  const totalSeats = Number(form.rows || 0) * Number(form.seatsPerRow || 0);

  const handleCreateEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title || !form.artist || !form.date || !form.time || !form.venue || !form.city) {
      toast({ title: "Missing fields", description: "Please fill all required event fields." });
      return;
    }

    setCreating(true);
    try {
      await createEventViaApi({
        title: form.title,
        artist: form.artist,
        date: form.date,
        time: form.time,
        venue: form.venue,
        city: form.city,
        price: Number(form.price),
        image: form.image,
        genre: form.genre,
        description: form.description || "Event created by admin",
        rows: Number(form.rows),
        seatsPerRow: Number(form.seatsPerRow),
      });

      toast({ title: "Event created", description: "New event was added successfully." });

      setForm({
        title: "",
        artist: "",
        date: "",
        time: "",
        venue: "",
        city: "",
        price: 50,
        image: "",
        genre: "Concerts",
        description: "",
        rows: 10,
        seatsPerRow: 10,
      });

      await loadData();
    } catch (error) {
      toast({
        title: "Create failed",
        description: error instanceof Error ? error.message : "Unable to create event",
      });
    } finally {
      setCreating(false);
    }
  };

  if (!authorized) return null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 space-y-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-golden-xl font-black flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground mt-2">Manage users, tickets and events via API Gateway.</p>
            <p className="text-xs text-muted-foreground mt-1">Signed in as {adminName}</p>
          </div>
          <button
            onClick={handleAdminLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-card border border-border">
            <p className="text-xs text-muted-foreground">Users</p>
            <p className="text-2xl font-black mt-1">{users.length}</p>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border">
            <p className="text-xs text-muted-foreground">Recent tickets</p>
            <p className="text-2xl font-black mt-1">{recentTickets.length}</p>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border">
            <p className="text-xs text-muted-foreground">Events</p>
            <p className="text-2xl font-black mt-1">{events.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="p-6 rounded-xl bg-card border border-border">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
              <CalendarPlus className="h-5 w-5 text-primary" /> Create Event
            </h2>
            <form className="space-y-3" onSubmit={handleCreateEvent}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
                <input value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} placeholder="Performer / Artist" className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
                <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Address / Venue" className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className="h-11 px-3 rounded-lg bg-secondary border border-border w-full">
                  {eventCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                <input type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="Ticket price" className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="number" min={1} value={form.rows} onChange={(e) => setForm({ ...form, rows: Number(e.target.value) })} placeholder="Rows" className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
                <input type="number" min={1} value={form.seatsPerRow} onChange={(e) => setForm({ ...form, seatsPerRow: Number(e.target.value) })} placeholder="Seats per row" className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <input 
                  value={form.image.startsWith('data:image') ? "Image selected and ready to upload" : form.image} 
                  onChange={(e) => setForm(prev => ({ ...prev, image: e.target.value }))} 
                  placeholder="Image URL or upload file ->" 
                  disabled={form.image.startsWith('data:image')}
                  className="h-11 px-3 rounded-lg bg-secondary border border-border w-full disabled:opacity-50" 
                />
                <div className="flex gap-2 w-full">
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/webp" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setForm(prev => ({ ...prev, image: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                    className="h-11 px-3 py-2 rounded-lg bg-secondary border border-border w-full text-sm cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" 
                  />
                  {form.image.startsWith('data:image') && (
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, image: "" }))} className="px-3 rounded-lg border border-border bg-destructive/10 text-destructive text-xs hover:bg-destructive hover:text-white transition-colors">Clear</button>
                  )}
                </div>
              </div>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="min-h-24 px-3 py-2 rounded-lg bg-secondary border border-border w-full" />
              <div className="p-3 rounded-lg bg-secondary text-sm text-muted-foreground border border-border">
                Seat plan: {form.rows} × {form.seatsPerRow} = <span className="text-foreground font-semibold">{totalSeats}</span>
              </div>
              <button disabled={creating} className="w-full h-11 rounded-lg gradient-primary text-primary-foreground font-bold disabled:opacity-60">
                {creating ? "Creating..." : "Create Event"}
              </button>
            </form>
          </section>

          <section className="p-6 rounded-xl bg-card border border-border">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
              <Ticket className="h-5 w-5 text-primary" /> Ticket Explorer
            </h2>

            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={() => fetchTickets("recent")} className={`px-3 py-2 rounded-lg text-xs border ${ticketMode === "recent" ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"}`}>All Recent</button>
              <button onClick={() => selectedShowId && fetchTickets("show", selectedShowId)} className={`px-3 py-2 rounded-lg text-xs border ${ticketMode === "show" ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"}`}>By Event</button>
              <button onClick={() => selectedUserId && fetchTickets("user", selectedUserId)} className={`px-3 py-2 rounded-lg text-xs border ${ticketMode === "user" ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"}`}>By User</button>
            </div>

            <div className="grid grid-cols-1 gap-2 mb-4">
              <select value={selectedShowId} onChange={(e) => setSelectedShowId(e.target.value)} className="h-10 px-3 rounded-lg bg-secondary border border-border text-sm">
                <option value="">Select event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="h-10 px-3 rounded-lg bg-secondary border border-border text-sm">
                <option value="">Select user</option>
                {users.filter((u) => !!u.userId).map((user) => (
                  <option key={user.email} value={String(user.userId)}>
                    {(user.fullName || user.username)} (#{user.userId})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {loadingTickets && <p className="text-xs text-muted-foreground">Loading tickets...</p>}
              {!loadingTickets && ticketDetails.length === 0 && (
                <p className="text-xs text-muted-foreground">No ticket bookings found for this filter.</p>
              )}
              {!loadingTickets && ticketDetails.map((ticket) => (
                <div key={ticket.bookingID} className="p-3 rounded-lg bg-secondary border border-border text-xs">
                  <p className="font-semibold text-foreground">{ticket.showTitle}</p>
                  <p className="text-muted-foreground">Booking #{ticket.bookingID} · Seat {ticket.seatNo}</p>
                  <p className="text-muted-foreground">By: {ticket.bookingBy} · {ticket.payMethod} · ${ticket.price}</p>
                  <p className="text-muted-foreground">Status: {ticket.bookingStatus}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="p-6 rounded-xl bg-card border border-border">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" /> Users
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {users.map((user) => (
              <div key={user.email} className="p-4 rounded-lg bg-secondary border border-border">
                <p className="font-semibold">{user.fullName || user.username}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">User ID: {user.userId || "N/A"}</p>
                {!!user.userId && (
                  <button
                    onClick={() => {
                      const value = String(user.userId);
                      setSelectedUserId(value);
                      fetchTickets("user", value);
                    }}
                    className="mt-2 px-3 py-1.5 rounded-lg text-xs border border-border bg-card hover:bg-background"
                  >
                    View user tickets
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 rounded-xl bg-card border border-border">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
            <Ticket className="h-5 w-5 text-primary" /> Current Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {events.map((event) => (
              <div key={event.id} className="p-4 rounded-lg bg-secondary border border-border">
                <p className="font-semibold line-clamp-1">{event.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{event.artist}</p>
                <p className="text-xs text-muted-foreground">{event.date} · {event.time}</p>
                <p className="text-xs text-muted-foreground">{event.venue}, {event.city}</p>
                <button
                  onClick={() => {
                    setSelectedShowId(event.id);
                    fetchTickets("show", event.id);
                  }}
                  className="mt-2 px-3 py-1.5 rounded-lg text-xs border border-border bg-card hover:bg-background"
                >
                  View event tickets
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
