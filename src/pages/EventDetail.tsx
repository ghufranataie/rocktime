import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowLeft, ShoppingCart } from "lucide-react";
import { fetchEvents, Event } from "@/data/events";
import { useCart } from "@/context/CartContext";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [bookedSeats, setBookedSeats] = useState<any[]>([]);

  // Fetch event by ID
  useEffect(() => {
    fetchEvents()
      .then((allEvents) => {
        const found = allEvents.find((e) => e.id === id) || null;
        setEvent(found);
      })
      .finally(() => setLoading(false));

    if (id && !id.startsWith("local-")) {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev";
      fetch(`${API_BASE_URL}/tickets?shwID=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.body && Array.isArray(data.body)) {
            setBookedSeats(data.body);
          }
        })
        .catch((err) => console.error("Error fetching tickets:", err));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Event not found.</p>
      </div>
    );
  }

  const serverTaken = bookedSeats.map(b => Number(b.seatNo)).filter(n => !isNaN(n));
  const taken = Array.from(new Set([...(event.seats?.taken || []), ...serverTaken]));
  const totalSeats = event.seats?.total || 60;
  
  const availableSeats = Math.max(0, totalSeats - bookedSeats.length);
  const isSoldOut = availableSeats === 0;

  const toggleSeat = (seat: number) => {
    if (taken.includes(seat)) return;
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const handleAddToCart = () => {
    if (selectedSeats.length === 0) return;
    addItem({
      eventId: event.id,
      eventTitle: event.title,
      seatNumbers: selectedSeats,
      pricePerSeat: event.price,
      date: event.date,
      time: event.time,
      venue: event.venue,
    });
    navigate("/cart");
  };

  const cols = Math.ceil(Math.sqrt(totalSeats * 1.5));

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-golden-lg md:text-golden-xl font-black text-foreground">{event.title}</h1>
            <p className="text-primary font-medium mt-1">{event.artist}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{event.venue}, {event.city}</span>
              </div>
              <div className="pt-3 border-t border-border">
                <span className="text-golden-lg font-bold text-primary">${event.price}</span>
                <span className="text-sm text-muted-foreground"> / ticket</span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-semibold mb-3">About This Event</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
            </div>
          </div>

          {/* Seat map */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Select Your Seats</h3>
                <span className={`px-3 py-1 text-sm rounded-full font-medium ${isSoldOut ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                  {availableSeats} seats available
                </span>
              </div>

              {/* Legend */}
              <div className="flex gap-6 mb-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-foreground/20 border border-border" /> Available
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-taken" /> Taken
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-primary" /> Selected
                </span>
              </div>

              {/* Stage */}
              <div className="mx-auto mb-6 w-2/3 h-8 rounded-t-full bg-secondary flex items-center justify-center text-xs text-muted-foreground font-medium">
                STAGE
              </div>

              {/* Seats grid */}
              <div
                className="grid gap-2 justify-center mx-auto"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: cols * 36 }}
              >
                {Array.from({ length: totalSeats }, (_, i) => i + 1).map((seat) => {
                  const isTaken = taken.includes(seat);
                  const isSelected = selectedSeats.includes(seat);
                  return (
                    <button
                      key={seat}
                      disabled={isTaken}
                      onClick={() => toggleSeat(seat)}
                      className={`w-7 h-7 rounded-full text-[10px] font-medium transition-all ${
                        isTaken
                          ? "bg-taken cursor-not-allowed"
                          : isSelected
                          ? "bg-primary text-primary-foreground shadow-glow scale-110"
                          : "bg-foreground/10 border border-border hover:border-primary/50 hover:bg-primary/20"
                      }`}
                      title={`Seat ${seat}`}
                    >
                      {!isTaken && seat}
                    </button>
                  );
                })}
              </div>

              {/* Add to cart */}
              {selectedSeats.length > 0 && (
                <div className="mt-8 p-4 rounded-xl bg-secondary/50 border border-border flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                  <div>
                    <p className="text-sm text-muted-foreground">{selectedSeats.length} seat(s) selected</p>
                    <p className="text-lg font-bold text-primary">${selectedSeats.length * event.price}</p>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={isSoldOut}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-bold transition-opacity ${isSoldOut ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {isSoldOut ? "Sold Out" : "Add to Cart"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}