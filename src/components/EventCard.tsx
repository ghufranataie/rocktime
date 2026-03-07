import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock } from "lucide-react";
import type { Event } from "@/data/events";

export default function EventCard({ event }: { event: Event }) {
  return (
    <Link
      to={`/event/${event.id}`}
      className="group block rounded-xl overflow-hidden bg-card shadow-card border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated hover:border-primary/30"
    >
      <div className="relative overflow-hidden aspect-[3/2]">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        {/* <span
          className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full ${
            event.availability === "passed" ? "tag-selling-fast" : "tag-available"
          }`}
        >
          {event.availability === "passed" ? "Selling Fast" : "Available"}
        </span> */}

        <span
          className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full 
            ${
              event.availability === "available"
                ? "bg-green-100 text-green-800"   // Available → green
                : event.availability === "passed"
                ? "bg-gray-300 text-gray-700"    // Passed → gray
                : "bg-red-100 text-red-800"      // Housefull → red
            }`}
        >
          {event.availability === "available"
            ? "Available"
            : event.availability === "passed"
            ? "Passed"
            : "Housefull"}
        </span>

        <span className="absolute bottom-3 left-3 text-golden-lg font-bold text-foreground">
          ${event.price}
        </span>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
          {event.title}
        </h3>
        <p className="text-sm text-muted-foreground">{event.artist}</p>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {event.time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {event.venue}
          </span>
        </div>
      </div>
    </Link>
  );
}
