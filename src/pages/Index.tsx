import { Link } from "react-router-dom";
import { ArrowRight, Music, Theater, Laugh, Sparkles } from "lucide-react";
import EventCard from "@/components/EventCard";
import { events, categories } from "@/data/events";
import heroBg from "@/assets/hero-bg.jpg";

const iconMap: Record<string, React.ElementType> = {
  Music, Drama: Theater, Laugh, PartyPopper: Sparkles, Trophy: Sparkles, BookOpen: Sparkles,
};

export default function HomePage() {
  const trending = events.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="Concert atmosphere" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto animate-slide-up">
          <h1 className="text-golden-xl md:text-golden-2xl font-black tracking-tight mb-6 text-foreground">
            Find Your Next<br />
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
          <Link to="/events" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>
    </div>
  );
}
