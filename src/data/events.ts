export interface Event {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  price: number;
  image: string;
  genre: string;
  availability: "available" | "passed" | "housefull";
  description: string;
  seats?: { total: number; taken: number[] };
}

export interface AdminEvent extends Event {
  rows: number;
  seatsPerRow: number;
  createdAt: string;
}

export interface CreateAdminEventInput {
  title: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  price: number;
  image?: string;
  genre: string;
  description: string;
  rows: number;
  seatsPerRow: number;
}

export const ADMIN_EVENTS_STORAGE_KEY = "showtime_admin_events";
const TAKEN_SEATS_STORAGE_KEY = "showtime_taken_seats";

const defaultEventImage =
  "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&h=700&fit=crop";

const canUseStorage = () => typeof window !== "undefined";

const uniqueSortedNumbers = (values: number[]) =>
  Array.from(new Set(values.filter((v) => Number.isFinite(v) && v > 0))).sort((a, b) => a - b);

const readAdminEvents = (): AdminEvent[] => {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(ADMIN_EVENTS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as AdminEvent[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveAdminEvents = (events: AdminEvent[]) => {
  if (!canUseStorage()) return;
  localStorage.setItem(ADMIN_EVENTS_STORAGE_KEY, JSON.stringify(events));
};

const readTakenSeatMap = (): Record<string, number[]> => {
  if (!canUseStorage()) return {};
  try {
    const raw = localStorage.getItem(TAKEN_SEATS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, number[]>) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const saveTakenSeatMap = (seatMap: Record<string, number[]>) => {
  if (!canUseStorage()) return;
  localStorage.setItem(TAKEN_SEATS_STORAGE_KEY, JSON.stringify(seatMap));
};

const mergeTakenSeats = (event: Event, localSeatMap: Record<string, number[]>) => {
  const takenFromEvent = event.seats?.taken || [];
  const takenFromLocalMap = localSeatMap[event.id] || [];
  return {
    ...event,
    seats: {
      total: event.seats?.total || 0,
      taken: uniqueSortedNumbers([...takenFromEvent, ...takenFromLocalMap]),
    },
  };
};

const fetchApiEvents = async (): Promise<Event[]> => {
  const res = await fetch("https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev/events");

  if (!res.ok) {
    throw new Error("Failed to fetch events");
  }

  const data = await res.json();

  return data.map((item: any) => {
    const totalTickets =
      item.tickets?.reduce((sum: number, ticket: any) => sum + ticket.shtTotalTickets, 0) || 0;

    const takenSeats: number[] = [];
    item.tickets?.forEach((ticket: any) => {
      ticket.bookings?.forEach((booking: any) => {
        if (booking.bokSeatNumber) takenSeats.push(booking.bokSeatNumber);
      });
    });

    const availabilityValues = ["available", "passed", "housefull"];
    let availability: "available" | "passed" | "housefull" = "available";
    if (item.availability && availabilityValues.includes(item.availability.toLowerCase())) {
      availability = item.availability.toLowerCase() as "available" | "passed" | "housefull";
    }

    return {
      id: String(item.shwID),
      title: item.shwTitle,
      artist: item.shwArtist,
      date: item.shwDate?.split("T")[0] || "",
      time: item.shwTime || "",
      venue: item.shwLocation || "",
      city: item.shwCity || "",
      price: Number(item.tickets?.[0]?.shtPrice || 0),
      image: item.shwImage || "",
      genre: item.shwCategory || "",
      availability,
      description: item.shwDetails || "",
      seats: { total: totalTickets, taken: takenSeats },
    } as Event;
  });
};

// Fetch events from AWS API Gateway and map to Event[]
export const fetchEvents = async (): Promise<Event[]> => {
  const seatMap = readTakenSeatMap();
  const localEvents = readAdminEvents().map((event) => mergeTakenSeats(event, seatMap));

  try {
    const apiEvents = await fetchApiEvents();
    const mergedApiEvents = apiEvents.map((event) => mergeTakenSeats(event, seatMap));
    return [...localEvents, ...mergedApiEvents];
  } catch (error) {
    console.error("Error fetching events:", error);
    return localEvents;
  }
};

export const createAdminEvent = (payload: CreateAdminEventInput): AdminEvent => {
  const rows = Math.max(1, Number(payload.rows || 1));
  const seatsPerRow = Math.max(1, Number(payload.seatsPerRow || 1));
  const totalSeats = rows * seatsPerRow;

  const newEvent: AdminEvent = {
    id: `local-${Date.now()}`,
    title: payload.title.trim(),
    artist: payload.artist.trim(),
    date: payload.date,
    time: payload.time,
    venue: payload.venue.trim(),
    city: payload.city.trim(),
    price: Number(payload.price || 0),
    image: payload.image?.trim() || defaultEventImage,
    genre: payload.genre.trim() || "Concerts",
    availability: "available",
    description: payload.description.trim(),
    seats: {
      total: totalSeats,
      taken: [],
    },
    rows,
    seatsPerRow,
    createdAt: new Date().toISOString(),
  };

  const current = readAdminEvents();
  saveAdminEvents([newEvent, ...current]);

  return newEvent;
};

export const reserveSeatsForEvent = (eventId: string, seats: number[]) => {
  const seatMap = readTakenSeatMap();
  seatMap[eventId] = uniqueSortedNumbers([...(seatMap[eventId] || []), ...seats]);
  saveTakenSeatMap(seatMap);

  const localEvents = readAdminEvents();
  const target = localEvents.find((event) => event.id === eventId);
  if (!target) return;

  target.seats = {
    total: target.seats?.total || target.rows * target.seatsPerRow,
    taken: uniqueSortedNumbers([...(target.seats?.taken || []), ...seats]),
  };
  saveAdminEvents(localEvents);
};

export const getAdminEvents = (): AdminEvent[] => readAdminEvents();

// Static categories
export const categories = [
  { name: "Concerts", icon: "Music", count: 42 },
  { name: "Theater", icon: "Drama", count: 18 },
  { name: "Comedy", icon: "Laugh", count: 24 },
  { name: "Festivals", icon: "PartyPopper", count: 8 },
  { name: "Sports", icon: "Trophy", count: 31 },
  { name: "Workshops", icon: "BookOpen", count: 15 },
];