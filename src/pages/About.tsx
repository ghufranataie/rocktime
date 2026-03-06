import { Users, Ticket, Globe, Star } from "lucide-react";
import { useEffect, useState } from "react";

const stats = [
  { icon: Ticket, value: "1M+", label: "Tickets Sold" },
  { icon: Globe, value: "50+", label: "Cities" },
  { icon: Users, value: "200K+", label: "Happy Customers" },
  { icon: Star, value: "4.9", label: "Average Rating" },
];


interface Founder {
  id: number;
  firstName: string;
  lastName: string;
  founderRole: string;
  avatar: string;
}
// const team = [
//   { name: "Sarah Chen", role: "CEO & Co-Founder", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face" },
//   { name: "Marcus Johnson", role: "CTO", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" },
//   { name: "Emily Rodriguez", role: "Head of Design", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face" },
//   { name: "David Kim", role: "Head of Partnerships", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face" },
// ];

export default function AboutPage() {
  const [team, setTeam] = useState<Founder[]>([]);

  useEffect(() => {
    fetch("https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev/founders")
      .then((res) => res.json())
      .then((data) => setTeam(data))
      .catch((err) => console.error(err));
  }, []);
  
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Mission */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h1 className="text-golden-xl font-black mb-6">
            We Make Live Events <span className="text-primary">Accessible</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            ShowTime was born from a simple belief: everyone deserves easy access to the magic of live entertainment. From intimate comedy clubs to grand concert halls, we connect fans with unforgettable moments through seamless technology and a passion for experiences.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {stats.map((stat) => (
            <div key={stat.label} className="p-6 rounded-xl bg-card border border-border text-center group hover:border-primary/40 transition-colors">
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-golden-lg font-black text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Team */}
        <div className="text-center mb-10">
          <h2 className="text-golden-lg font-bold">The Developers Team Are</h2>
          <p className="text-muted-foreground mt-2">The people behind your next experience</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {team.map((member) => (
            <div key={member.id} className="text-center group">
              <img
                src={member.avatar}
                alt={member.firstName}
                className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-2 border-border group-hover:border-primary transition-colors"
              />
              <p className="font-semibold text-sm">{member.lastName}</p>
              <p className="text-xs text-muted-foreground">{member.founderRole}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}