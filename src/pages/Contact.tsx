import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-golden-xl font-black">Get In <span className="text-primary">Touch</span></h1>
          <p className="text-muted-foreground mt-2">We'd love to hear from you</p>
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-xl bg-card border border-border space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10"><MapPin className="h-5 w-5 text-primary" /></div>
              <div><h4 className="font-semibold text-sm">Address</h4><p className="text-sm text-muted-foreground">1750 Finch Ave E, North York, ON M2J 2X5</p></div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10"><Phone className="h-5 w-5 text-primary" /></div>
              <div><h4 className="font-semibold text-sm">Phone</h4><p className="text-sm text-muted-foreground">+1 (647) 821-9911</p></div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10"><Mail className="h-5 w-5 text-primary" /></div>
              <div><h4 className="font-semibold text-sm">Email</h4><p className="text-sm text-muted-foreground">info@rocktime.com</p></div>
            </div>
          </div>
          {/* Map placeholder */}
          <div className="h-64 rounded-xl bg-card border border-border overflow-hidden flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-10 w-10 mx-auto mb-2 text-primary/40" />
              <p className="text-sm">Map View</p>
              <p className="text-xs">1750 Finch Ave E, North York</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
