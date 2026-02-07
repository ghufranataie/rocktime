import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import EventCard from "@/components/EventCard";
import { events } from "@/data/events";

const genres = ["All", "Concerts", "Theater", "Comedy"];

export default function EventsPage() {
  const [searchParams] = useSearchParams();
  const initialGenre = searchParams.get("genre") || "All";

  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState(initialGenre);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
  const [availability, setAvailability] = useState<string>("all");

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (genre !== "All" && e.genre !== genre) return false;
      if (query && !e.title.toLowerCase().includes(query.toLowerCase()) && !e.artist.toLowerCase().includes(query.toLowerCase())) return false;
      if (e.price < priceRange[0] || e.price > priceRange[1]) return false;
      if (availability !== "all" && e.availability !== availability) return false;
      return true;
    });
  }, [query, genre, priceRange, availability]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-golden-xl font-black mb-2">Events</h1>
        <p className="text-muted-foreground mb-8">Discover your next unforgettable experience</p>

        {/* Search + Filter toggle */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events or artists..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="h-12 px-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="mb-6 p-6 rounded-xl bg-card border border-border animate-fade-in space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setFilterOpen(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Price Range</label>
              <div className="flex items-center gap-3">
                <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])} className="w-24 h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm" />
                <span className="text-muted-foreground">—</span>
                <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], +e.target.value])} className="w-24 h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Availability</label>
              <div className="flex gap-2">
                {["all", "available", "selling-fast"].map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvailability(a)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      availability === a ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {a === "all" ? "All" : a === "available" ? "Available" : "Selling Fast"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Genre tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap border transition-colors ${
                genre === g ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No events found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
