import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      toast({
        title: "Success",
        description: "Your message has been sent. We'll get back to you shortly.",
      });

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                className="w-full p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject"
              className="w-full p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              rows={5}
              className="w-full p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
              required
            ></textarea>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
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