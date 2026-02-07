import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, Ticket } from "lucide-react";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Events", to: "/events" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Ticket className="h-7 w-7 text-primary transition-transform group-hover:rotate-12" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            Show<span className="text-primary">Time</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link to="/events" className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <Search className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link to="/cart" className="p-2 rounded-lg hover:bg-secondary transition-colors relative">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Link>
          <Link
            to="/auth"
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <User className="h-4 w-4" />
            Sign In
          </Link>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border animate-fade-in">
          <div className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="py-3 px-4 rounded-lg text-sm font-semibold bg-primary text-primary-foreground text-center mt-2"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
