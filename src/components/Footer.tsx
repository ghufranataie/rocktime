import { Ticket } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Ticket className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">RockTime</span>
            </div>
            <p className="text-sm text-muted-foreground">Your gateway to unforgettable live experiences.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Explore</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/events" className="hover:text-primary transition-colors">All Events</Link>
              <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">
              <Link to="/events" className="hover:text-primary transition-colors">Categories</Link>
            </h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/events?genre=Concerts" className="hover:text-primary transition-colors">Concerts</Link>
              <Link to="/events?genre=Theater" className="hover:text-primary transition-colors">Theater</Link>
              <Link to="/events?genre=Comedy" className="hover:text-primary transition-colors">Comedy</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-xs text-muted-foreground">
          © 2026 RockTime. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
