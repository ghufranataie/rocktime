import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, QrCode, ArrowLeft, CreditCard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { reserveSeatsForEvent } from "@/data/events";
import { useToast } from "@/components/ui/use-toast";

const USERS_STORAGE_KEY = "showtime_users";
const USER_STORAGE_KEY = "showtime_user";
const TICKETS_STORAGE_KEY = "showtime_tickets";
const PENDING_ORDER_KEY = "showtime_pending_order";
const STRIPE_CHECKOUT_ENDPOINT =
  import.meta.env.VITE_STRIPE_CHECKOUT_ENDPOINT ||
  "https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev/checkout";

interface StoredUser {
  username: string;
  email: string;
  fullName?: string;
}

interface StoredTicket {
  id: string;
  orderId: string;
  userEmail: string;
  userName: string;
  eventId: string;
  eventTitle: string;
  seatNumber: number;
  eventDate: string;
  eventTime: string;
  venue: string;
  pricePerSeat: number;
  purchasedAt: string;
}

interface PendingOrder {
  items: typeof initialItemsShape;
  userEmail: string;
  userName: string;
}

type CartSnapshotItem = {
  eventId: string;
  eventTitle: string;
  seatNumbers: number[];
  pricePerSeat: number;
  date: string;
  time: string;
  venue: string;
};

const initialItemsShape: CartSnapshotItem[] = [];

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const upsertUser = (user: StoredUser) => {
  const users = readJson<StoredUser[]>(USERS_STORAGE_KEY, []);
  const next = users.filter((item) => item.email !== user.email);
  next.unshift(user);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(next));
};

type Step = "review" | "details" | "payment" | "success";

const getCurrentUser = () => readJson<StoredUser | null>(USER_STORAGE_KEY, null);

const finalizeSuccessfulPayment = (
  pendingOrder: PendingOrder,
  clearCart: () => void,
) => {
  upsertUser({
    username: pendingOrder.userEmail.split("@")[0],
    email: pendingOrder.userEmail,
    fullName: pendingOrder.userName,
  });

  const existingTickets = readJson<StoredTicket[]>(TICKETS_STORAGE_KEY, []);
  const purchasedAt = new Date().toISOString();
  const orderId = `ST-${Date.now().toString(36).toUpperCase()}`;

  const newTickets: StoredTicket[] = pendingOrder.items.flatMap((item) =>
    item.seatNumbers.map((seatNumber) => ({
      id: `${item.eventId}-${seatNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      orderId,
      userEmail: pendingOrder.userEmail,
      userName: pendingOrder.userName,
      eventId: item.eventId,
      eventTitle: item.eventTitle,
      seatNumber,
      eventDate: item.date,
      eventTime: item.time,
      venue: item.venue,
      pricePerSeat: item.pricePerSeat,
      purchasedAt,
    })),
  );

  localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify([...newTickets, ...existingTickets]));

  pendingOrder.items.forEach((item) => {
    reserveSeatsForEvent(item.eventId, item.seatNumbers);
  });

  localStorage.removeItem(PENDING_ORDER_KEY);
  clearCart();
  window.dispatchEvent(new Event("auth-changed"));
};

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("review");
  const [form, setForm] = useState({ name: "", email: "" });
  const [isRedirectingToStripe, setIsRedirectingToStripe] = useState(false);
  const tax = totalPrice * 0.08;
  const total = totalPrice + tax;

  const hasItems = items.length > 0;

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setForm((prev) => ({
        name: prev.name || currentUser.fullName || currentUser.username,
        email: prev.email || currentUser.email,
      }));
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeStatus = params.get("stripe");

    if (stripeStatus === "success") {
      const pendingOrder = readJson<PendingOrder | null>(PENDING_ORDER_KEY, null);
      if (pendingOrder && pendingOrder.items.length > 0) {
        finalizeSuccessfulPayment(pendingOrder, clearCart);
      }

      setStep("success");
      window.history.replaceState({}, "", "/checkout");
      return;
    }

    if (stripeStatus === "cancel") {
      toast({
        title: "Payment cancelled",
        description: "You can continue checkout when you are ready.",
      });
      window.history.replaceState({}, "", "/checkout");
    }
  }, [clearCart, toast]);

  useEffect(() => {
    if (!hasItems && step !== "success") {
      navigate("/cart");
    }
  }, [hasItems, navigate, step]);

  const checkoutPayloadItems = useMemo(
    () =>
      items.map((item) => ({
        eventId: item.eventId,
        eventTitle: item.eventTitle,
        seatNumbers: item.seatNumbers,
        pricePerSeat: item.pricePerSeat,
        date: item.date,
        time: item.time,
        venue: item.venue,
      })),
    [items],
  );

  const steps: { key: Step; label: string }[] = [
    { key: "review", label: "Review" },
    { key: "details", label: "Details" },
    { key: "payment", label: "Stripe" },
  ];

  const handleStripeCheckout = async () => {
    const userEmail = form.email.trim().toLowerCase();
    const userName = form.name.trim();

    if (!userEmail) {
      toast({
        title: "Email is required",
        description: "Please add your email before payment.",
      });
      return;
    }

    const currentUser = getCurrentUser();

    const pendingOrder: PendingOrder = {
      items: checkoutPayloadItems,
      userEmail,
      userName: userName || currentUser?.fullName || currentUser?.username || "Guest",
    };

    localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(pendingOrder));

    setIsRedirectingToStripe(true);

    try {
      const successUrl = `${window.location.origin}/checkout?stripe=success`;
      const cancelUrl = `${window.location.origin}/checkout?stripe=cancel`;

      const response = await fetch(STRIPE_CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: checkoutPayloadItems,
          customerEmail: userEmail,
          userId: currentUser?.username || "",
          successUrl,
          cancelUrl,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Unable to start Stripe checkout");
      }

      if (!data?.url) {
        throw new Error("Stripe checkout URL is missing");
      }

      window.location.href = data.url;
    } catch (error) {
      setIsRedirectingToStripe(false);
      toast({
        title: "Payment error",
        description: error instanceof Error ? error.message : "Unable to start payment",
      });
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-glow animate-fade-in">
          <Check className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-golden-xl font-black">Booking Confirmed!</h1>
        <p className="text-muted-foreground max-w-md">Your tickets have been booked. Show the QR code below at the venue entrance.</p>
        <div className="p-8 rounded-xl bg-card border border-border">
          <QrCode className="h-32 w-32 text-primary mx-auto" />
          <p className="mt-4 text-xs text-muted-foreground">Order #ST-{Date.now().toString(36).toUpperCase()}</p>
        </div>
        <button onClick={() => navigate("/")} className="px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-bold">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <button onClick={() => navigate("/cart")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </button>
        <h1 className="text-golden-xl font-black mb-8">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s.key ? "gradient-primary text-primary-foreground" : steps.indexOf(steps.find((x) => x.key === step)!) > i ? "bg-primary/30 text-primary" : "bg-secondary text-muted-foreground"
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${step === s.key ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className="w-8 sm:w-12 h-px bg-border" />}
            </div>
          ))}
        </div>

        {step === "review" && (
          <div className="space-y-4 animate-fade-in">
            {items.map((item) => (
              <div key={item.eventId} className="p-4 rounded-xl bg-card border border-border flex justify-between">
                <div>
                  <p className="font-semibold">{item.eventTitle}</p>
                  <p className="text-xs text-muted-foreground">{item.seatNumbers.length} ticket(s) · Seats {item.seatNumbers.join(", ")}</p>
                </div>
                <span className="font-bold text-primary">${(item.seatNumbers.length * item.pricePerSeat).toFixed(2)}</span>
              </div>
            ))}
            <div className="p-4 rounded-xl bg-card border border-border flex justify-between font-bold">
              <span>Total</span><span className="text-primary">${total.toFixed(2)}</span>
            </div>
            <button onClick={() => setStep("details")} className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg">Continue</button>
          </div>
        )}

        {step === "details" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none" placeholder="John Doe" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none" placeholder="john@email.com" />
            </div>
            <button onClick={() => setStep("payment")} className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg">Continue to Payment</button>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-2 mb-2"><CreditCard className="h-5 w-5 text-primary" /><span className="font-semibold">Pay with Stripe Checkout</span></div>
              <p className="text-sm text-muted-foreground">
                You will be redirected to Stripe secure payment page to finish your order.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>Email: <span className="text-foreground">{form.email || "Not set"}</span></p>
                <p>Total: <span className="text-primary font-semibold">${total.toFixed(2)}</span></p>
              </div>
            </div>
            <button
              onClick={handleStripeCheckout}
              disabled={isRedirectingToStripe}
              className="w-full py-4 rounded-xl bg-[#635bff] text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isRedirectingToStripe ? "Redirecting to Stripe..." : `Pay $${total.toFixed(2)} with Stripe`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
