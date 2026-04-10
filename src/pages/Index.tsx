import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Music,
  Theater,
  Laugh,
  Sparkles,
  ShieldCheck,
  Ticket,
  Zap,
} from "lucide-react";
import EventCard from "@/components/EventCard";
import { fetchEvents, categories, Event } from "@/data/events";
import heroBg from "@/assets/hero-bg.jpg";

const iconMap: Record<string, React.ElementType> = {
  Music,
  Drama: Theater,
  Laugh,
  PartyPopper: Sparkles,
  Trophy: Sparkles,
  BookOpen: Sparkles,
};

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);

  // Fetch events on mount
  useEffect(() => {
    fetchEvents().then(setEvents);
  }, []);

  // Take first 8 trending events
  const trending = events.slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt="Concert atmosphere"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto animate-slide-up">
          <h1 className="text-golden-xl md:text-golden-2xl font-black tracking-tight mb-6 text-foreground">
            Find Your Next
            <br />
            <span className="text-primary">Experience</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            Discover concerts, theater, comedy & more. Book your tickets to the hottest events in seconds.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg shadow-glow hover:opacity-90 transition-all animate-pulse-glow"
          >
            Browse Shows
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-golden-lg font-bold mb-8">Featured Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] || Sparkles;
            return (
              <Link
                key={cat.name}
                to={`/events?genre=${cat.name}`}
                className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-glow transition-all group"
              >
                <Icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">{cat.name}</span>
                <span className="text-xs text-muted-foreground">{cat.count} events</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trending */}
      <section className="container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-golden-lg font-bold">Trending Now</h2>
          <Link
            to="/events"
            className="text-primary text-sm font-medium flex items-center gap-1 hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.length > 0 ? (
            trending.map((e) => <EventCard key={e.id} event={e} />)
          ) : (
            <div className="col-span-full flex justify-center items-center py-10">
              <div className="w-12 h-12 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </section>

      {/* Why RockTime */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-golden-lg font-bold mb-8">Why fans choose RockTime</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <Zap className="h-7 w-7 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Fast booking flow</h3>
            <p className="text-sm text-muted-foreground">
              Pick your event, choose seats, and complete checkout in minutes with a smooth and modern experience.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <ShieldCheck className="h-7 w-7 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Secure payments</h3>
            <p className="text-sm text-muted-foreground">
              Protected checkout and trusted payment processing help you book confidently every time.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <Ticket className="h-7 w-7 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Digital tickets instantly</h3>
            <p className="text-sm text-muted-foreground">
              Receive your tickets right away in your account and email, ready to use on event day.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-golden-lg font-bold mb-8">How RockTime works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border p-6 bg-card/60">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-4">1</span>
            <h3 className="font-semibold mb-2">Discover events</h3>
            <p className="text-sm text-muted-foreground">Browse concerts, theater, and comedy in one place.</p>
          </div>
          <div className="rounded-2xl border border-border p-6 bg-card/60">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-4">2</span>
            <h3 className="font-semibold mb-2">Choose seats</h3>
            <p className="text-sm text-muted-foreground">Select the best available seats that fit your budget and vibe.</p>
          </div>
          <div className="rounded-2xl border border-border p-6 bg-card/60">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-4">3</span>
            <h3 className="font-semibold mb-2">Enjoy the show</h3>
            <p className="text-sm text-muted-foreground">Get your e-ticket instantly and focus on the experience.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-24">
        <div className="rounded-2xl border border-primary/30 bg-card p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black mb-2">Ready for your next night out?</h2>
            <p className="text-muted-foreground">Find top events and book your seats with RockTime today.</p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Explore all events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}