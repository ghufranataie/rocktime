import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Clock, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, removeItem, totalPrice } = useCart();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(600); // 10 min

  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [items.length]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const tax = totalPrice * 0.08;

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-golden-lg font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground">Browse events and add tickets to get started.</p>
        <Link to="/events" className="px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-bold">
          Browse Events
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-golden-xl font-black mb-2">Your Cart</h1>
        <div className="flex items-center gap-2 text-sm mb-8">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">
            Tickets reserved for{" "}
            <span className="text-primary font-bold">{mins}:{secs.toString().padStart(2, "0")}</span>
          </span>
        </div>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div key={item.eventId} className="p-5 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold">{item.eventTitle}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.venue} · {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {item.time}</p>
                <p className="text-xs text-muted-foreground mt-1">Seats: {item.seatNumbers.join(", ")}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-primary">${item.seatNumbers.length * item.pricePerSeat}</span>
                <button onClick={() => removeItem(item.eventId)} className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="p-6 rounded-xl bg-card border border-border space-y-3">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax & Fees (8%)</span><span>${tax.toFixed(2)}</span></div>
          <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">${(totalPrice + tax).toFixed(2)}</span>
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity"
          >
            Proceed to Checkout <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
