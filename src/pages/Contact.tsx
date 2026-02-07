import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-golden-xl font-black">Get In <span className="text-primary">Touch</span></h1>
          <p className="text-muted-foreground mt-2">We'd love to hear from you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="p-8 rounded-xl bg-card border border-border space-y-5">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Name</label>
              <input className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none" placeholder="Your name" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email</label>
              <input type="email" className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none" placeholder="you@email.com" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
              <input className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none" placeholder="How can we help?" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Message</label>
              <textarea rows={5} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none resize-none" placeholder="Tell us more..." />
            </div>
            <button className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Send className="h-4 w-4" /> Send Message
            </button>
          </div>

          {/* Info + Map */}
          <div className="space-y-6">
            <div className="p-8 rounded-xl bg-card border border-border space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10"><MapPin className="h-5 w-5 text-primary" /></div>
                <div><h4 className="font-semibold text-sm">Address</h4><p className="text-sm text-muted-foreground">123 Broadway, New York, NY 10001</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10"><Phone className="h-5 w-5 text-primary" /></div>
                <div><h4 className="font-semibold text-sm">Phone</h4><p className="text-sm text-muted-foreground">+1 (555) 123-4567</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10"><Mail className="h-5 w-5 text-primary" /></div>
                <div><h4 className="font-semibold text-sm">Email</h4><p className="text-sm text-muted-foreground">hello@showtime.com</p></div>
              </div>
            </div>
            {/* Map placeholder */}
            <div className="h-64 rounded-xl bg-card border border-border overflow-hidden flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-10 w-10 mx-auto mb-2 text-primary/40" />
                <p className="text-sm">Map View</p>
                <p className="text-xs">123 Broadway, New York</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
