import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Check, QrCode, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";

type Step = "review" | "details" | "payment" | "success";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("review");
  const [form, setForm] = useState({ name: "", email: "", card: "", expiry: "", cvv: "" });
  const tax = totalPrice * 0.08;
  const total = totalPrice + tax;

  if (items.length === 0 && step !== "success") {
    navigate("/cart");
    return null;
  }

  const steps: { key: Step; label: string }[] = [
    { key: "review", label: "Review" },
    { key: "details", label: "Details" },
    { key: "payment", label: "Payment" },
  ];

  const handlePay = () => {
    clearCart();
    setStep("success");
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
              <div className="flex items-center gap-2 mb-2"><CreditCard className="h-5 w-5 text-primary" /><span className="font-semibold">Card Payment</span></div>
              <input value={form.card} onChange={(e) => setForm({ ...form, card: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none" placeholder="1234 5678 9012 3456" />
              <div className="grid grid-cols-2 gap-4">
                <input value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} className="h-12 px-4 rounded-xl bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none" placeholder="MM/YY" />
                <input value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value })} className="h-12 px-4 rounded-xl bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none" placeholder="CVV" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="py-3 rounded-xl bg-card border border-border text-foreground font-medium text-sm hover:bg-secondary transition-colors"> Pay with Apple Pay</button>
              <button className="py-3 rounded-xl bg-card border border-border text-foreground font-medium text-sm hover:bg-secondary transition-colors"> Pay with Google Pay</button>
            </div>
            <button onClick={handlePay} className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg">Pay ${total.toFixed(2)}</button>
          </div>
        )}
      </div>
    </div>
  );
}
