import { FormEvent, useEffect, useMemo, useState } from "react";
import { Shield, Users, Ticket, CalendarPlus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { createEventViaApi, fetchEvents, Event } from "@/data/events";
import { getAdminSession, getAdminAuthEventName, logoutAdmin } from "@/lib/adminAuth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev";

interface ApiUser {
  usrID?: number;
  usrName?: string;
  usrFullName?: string;
  usrEmail?: string;

  id?: number;
  username: string;
  fullName?: string;
  email: string;
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

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [tickets, setTickets] = useState<ApiTicket[]>([]);
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
    username: user.username || user.usrName || "unknown",
    email: user.email || user.usrEmail || "",
    fullName: user.fullName || user.usrFullName || "",
  });

  const loadData = async () => {
    const [fetchedEvents, usersRes, ticketsRes] = await Promise.all([
      fetchEvents(),
      fetch(`${API_BASE_URL}/users`),
      fetch(`${API_BASE_URL}/tickets`),
    ]);

    setEvents(fetchedEvents);

    const usersData = await usersRes.json().catch(() => []);
    const normalizedUsers = Array.isArray(usersData)
      ? usersData.map((user) => normalizeUser(user as ApiUser))
      : [];
    setUsers(normalizedUsers.filter((user) => !!user.email));

    const ticketsData = await ticketsRes.json().catch(() => ({}));
    setTickets(Array.isArray(ticketsData?.body) ? ticketsData.body : []);
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
    toast({
      title: "Signed out",
      description: "Admin session closed.",
    });
    navigate("/admin-auth", { replace: true });
  };

  const ticketsByUser = useMemo(() => {
    return tickets.reduce<Record<string, ApiTicket[]>>((acc, ticket) => {
      const key = (ticket.bookingBy || "").toLowerCase();
      if (!key) return acc;
      acc[key] = [...(acc[key] || []), ticket];
      return acc;
    }, {});
  }, [tickets]);

  const usersWithFallback = useMemo(() => {
    const map = new Map<string, ApiUser>();

    users.forEach((user) => {
      map.set(user.email, user);
    });

    return Array.from(map.values());
  }, [users, ticketsByUser]);

  const totalSeats = Number(form.rows || 0) * Number(form.seatsPerRow || 0);

  const handleCreateEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title || !form.artist || !form.date || !form.time || !form.venue || !form.city) {
      toast({
        title: "Missing fields",
        description: "Please fill all required event fields.",
      });
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

      toast({
        title: "Event created",
        description: "New event was added successfully.",
      });

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

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 space-y-8">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-golden-xl font-black flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                Admin Panel
              </h1>
              <p className="text-muted-foreground mt-2">Manage users, tickets and events (frontend demo mode).</p>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-card border border-border">
            <p className="text-xs text-muted-foreground">Users</p>
            <p className="text-2xl font-black mt-1">{usersWithFallback.length}</p>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border">
            <p className="text-xs text-muted-foreground">Tickets sold</p>
            <p className="text-2xl font-black mt-1">{tickets.length}</p>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border">
            <p className="text-xs text-muted-foreground">Events</p>
            <p className="text-2xl font-black mt-1">{events.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="p-6 rounded-xl bg-card border border-border">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
              <CalendarPlus className="h-5 w-5 text-primary" />
              Create Event
            </h2>
            <form className="space-y-3" onSubmit={handleCreateEvent}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Event title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Performer / Artist</label>
                  <input value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} placeholder="Performer" className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Time</label>
                  <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Address / Venue</label>
                  <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Address / venue" className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">City</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                  <select
                    value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                    className="h-11 px-3 rounded-lg bg-secondary border border-border w-full"
                  >
                    {eventCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Ticket price (USD)</label>
                  <input type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="e.g. 50" className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Rows count</label>
                  <input type="number" min={1} value={form.rows} onChange={(e) => setForm({ ...form, rows: Number(e.target.value) })} placeholder="e.g. 10" className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Seats per row</label>
                  <input type="number" min={1} value={form.seatsPerRow} onChange={(e) => setForm({ ...form, seatsPerRow: Number(e.target.value) })} placeholder="e.g. 10" className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
                </div>
              </div>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL (optional)" className="h-11 px-3 rounded-lg bg-secondary border border-border w-full" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="min-h-24 px-3 py-2 rounded-lg bg-secondary border border-border w-full" />
              <div className="p-3 rounded-lg bg-secondary text-sm text-muted-foreground border border-border">
                Seat plan: {form.rows} rows × {form.seatsPerRow} seats = <span className="text-foreground font-semibold">{totalSeats}</span> total seats (numbered from 1 to {Math.max(totalSeats, 1)}).
              </div>
              <button disabled={creating} className="w-full h-11 rounded-lg gradient-primary text-primary-foreground font-bold disabled:opacity-60">
                {creating ? "Creating..." : "Create Event"}
              </button>
            </form>
          </section>

          <section className="p-6 rounded-xl bg-card border border-border">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              Users & Tickets
            </h2>
            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
              {usersWithFallback.length === 0 && (
                <p className="text-sm text-muted-foreground">No users yet.</p>
              )}

              {usersWithFallback.map((user) => {
                const matchKey = (user.fullName || user.username || "").toLowerCase();
                const userTickets = ticketsByUser[matchKey] || [];
                const totalSpent = userTickets.reduce((sum, ticket) => sum + Number(ticket.price || 0), 0);
                return (
                  <div key={user.email} className="p-4 rounded-lg bg-secondary border border-border">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{user.fullName || user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Tickets</p>
                        <p className="font-bold">{userTickets.length}</p>
                      </div>
                    </div>

                    {userTickets.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {userTickets.slice(0, 5).map((ticket) => (
                          <p key={ticket.bookingID} className="text-xs text-muted-foreground">
                            {ticket.showTitle} · Seat {ticket.seatNo} · ${ticket.price}
                          </p>
                        ))}
                        {userTickets.length > 5 && (
                          <p className="text-xs text-muted-foreground">+{userTickets.length - 5} more tickets</p>
                        )}
                        <p className="text-xs font-semibold text-foreground pt-1">Total: ${totalSpent.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="p-6 rounded-xl bg-card border border-border">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
            <Ticket className="h-5 w-5 text-primary" />
            Current Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {events.map((event) => (
              <div key={event.id} className="p-4 rounded-lg bg-secondary border border-border">
                <p className="font-semibold line-clamp-1">{event.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{event.artist}</p>
                <p className="text-xs text-muted-foreground">{event.date} · {event.time}</p>
                <p className="text-xs text-muted-foreground">{event.venue}, {event.city}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Seats: {event.seats?.total || 0} total · {(event.seats?.taken || []).length} taken
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
