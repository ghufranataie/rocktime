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
  availability: "available" | "selling-fast";
  description: string;
  seats?: { total: number; taken: number[] };
}

// Fetch events from AWS API Gateway and map to Event[]
export const fetchEvents = async (): Promise<Event[]> => {
  try {
    const res = await fetch(
      "https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev/events"
    );

    if (!res.ok) {
      throw new Error("Failed to fetch events");
    }

    const data = await res.json();

    const events: Event[] = data.map((item: any) => {
      const totalTickets =
        item.tickets?.reduce(
          (sum: number, ticket: any) => sum + ticket.shtTotalTickets,
          0
        ) || 0;

      const takenSeats: number[] = [];
      item.tickets?.forEach((ticket: any) => {
        ticket.bookings?.forEach((booking: any) => {
          if (booking.bokSeatNumber) takenSeats.push(booking.bokSeatNumber);
        });
      });

      let availability: "available" | "selling-fast" = "available";
      if (item.availability?.toLowerCase() === "selling-fast") {
        availability = "selling-fast";
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
      };
    });

    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

// Static categories
export const categories = [
  { name: "Concerts", icon: "Music", count: 42 },
  { name: "Theater", icon: "Drama", count: 18 },
  { name: "Comedy", icon: "Laugh", count: 24 },
  { name: "Festivals", icon: "PartyPopper", count: 8 },
  { name: "Sports", icon: "Trophy", count: 31 },
  { name: "Workshops", icon: "BookOpen", count: 15 },
];