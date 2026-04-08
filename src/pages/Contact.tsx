import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-golden-xl font-black">
            Get In <span className="text-primary">Touch</span>
          </h1>
          <p className="text-muted-foreground mt-2">We'd love to hear from you</p>
        </div>

        {/* Contact Form */}
        <div className="p-8 mb-12 rounded-xl bg-card border border-border space-y-6">
          <h2 className="text-lg font-semibold text-primary">Send us a message</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              className="w-full p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
            <textarea
              placeholder="Your Message"
              rows={5}
              className="w-full p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
              required
            ></textarea>
            <button
              type="submit"
              className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Details */}
        <div className="space-y-6">
          <div className="p-8 rounded-xl bg-card border border-border space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Address</h4>
                <p className="text-sm text-muted-foreground">
                  1750 Finch Ave E, North York, ON M2J 2X5
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Phone</h4>
                <p className="text-sm text-muted-foreground">+1 (647) 821-9911</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Email</h4>
                <p className="text-sm text-muted-foreground">info@rocktime.com</p>
              </div>
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