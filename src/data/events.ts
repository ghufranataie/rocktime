export interface Event {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  price: number;
  image: string;
  genre: string;
  availability: "available" | "selling-fast";
  description: string;
  seats?: { total: number; taken: number[] };
}

export const events: Event[] = [
  {
    id: "1",
    title: "Neon Horizon World Tour",
    artist: "Aurora Blake",
    date: "2026-03-15",
    time: "20:00",
    venue: "Madison Square Garden",
    city: "New York",
    price: 89,
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop",
    genre: "Concerts",
    availability: "selling-fast",
    description: "Experience the electrifying Neon Horizon World Tour with Aurora Blake. A night of pulsating beats, mesmerizing visuals, and unforgettable music.",
    seats: { total: 80, taken: [3, 7, 12, 15, 22, 28, 33, 41, 55, 60, 67, 72] },
  },
  {
    id: "2",
    title: "The Phantom's Return",
    artist: "West End Revival",
    date: "2026-03-22",
    time: "19:30",
    venue: "Royal Theater",
    city: "London",
    price: 120,
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&h=400&fit=crop",
    genre: "Theater",
    availability: "available",
    description: "A stunning revival of the classic phantom tale, brought to life with breathtaking sets, costumes, and performances by the West End Revival company.",
    seats: { total: 60, taken: [5, 11, 19, 25, 38, 44] },
  },
  {
    id: "3",
    title: "Laugh Until Dawn",
    artist: "Dave Morales",
    date: "2026-04-05",
    time: "21:00",
    venue: "The Comedy Store",
    city: "Los Angeles",
    price: 45,
    image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600&h=400&fit=crop",
    genre: "Comedy",
    availability: "available",
    description: "Get ready for a night of non-stop laughter with the legendary Dave Morales, known for his sharp wit and hilarious storytelling.",
    seats: { total: 40, taken: [2, 8, 14, 20, 30] },
  },
  {
    id: "4",
    title: "Synthwave Dreams Festival",
    artist: "Various Artists",
    date: "2026-04-12",
    time: "18:00",
    venue: "Coachella Valley",
    city: "Indio",
    price: 199,
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop",
    genre: "Concerts",
    availability: "selling-fast",
    description: "An immersive two-day synthwave festival featuring the best electronic artists from around the world. Prepare for stunning light shows and incredible beats.",
    seats: { total: 100, taken: [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95] },
  },
  {
    id: "5",
    title: "Shakespeare Under Stars",
    artist: "Globe Players",
    date: "2026-04-20",
    time: "20:30",
    venue: "Central Park Amphitheater",
    city: "New York",
    price: 65,
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&h=400&fit=crop",
    genre: "Theater",
    availability: "available",
    description: "A magical evening of Shakespeare performed under the open sky. The Globe Players bring timeless stories to life in an intimate outdoor setting.",
    seats: { total: 50, taken: [3, 9, 17, 23, 31, 39, 45] },
  },
  {
    id: "6",
    title: "Midnight Jazz Sessions",
    artist: "The Blue Note Collective",
    date: "2026-05-01",
    time: "22:00",
    venue: "Blue Note Jazz Club",
    city: "Chicago",
    price: 55,
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&h=400&fit=crop",
    genre: "Concerts",
    availability: "available",
    description: "Lose yourself in the smooth, soulful sounds of The Blue Note Collective. An intimate jazz experience that will transport you to another era.",
    seats: { total: 30, taken: [4, 10, 18, 24] },
  },
  {
    id: "7",
    title: "Stand Up Showdown",
    artist: "Mixed Lineup",
    date: "2026-05-10",
    time: "20:00",
    venue: "Gotham Comedy Club",
    city: "New York",
    price: 35,
    image: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=600&h=400&fit=crop",
    genre: "Comedy",
    availability: "selling-fast",
    description: "Five of the hottest comedians battle it out for the title of funniest in town. You decide who wins!",
    seats: { total: 45, taken: [1, 6, 11, 16, 21, 26, 31, 36, 41] },
  },
  {
    id: "8",
    title: "Electronic Pulse",
    artist: "DJ Nexus",
    date: "2026-05-18",
    time: "23:00",
    venue: "Warehouse 42",
    city: "Berlin",
    price: 75,
    image: "https://images.unsplash.com/photo-1571266028243-d220d14bfdd3?w=600&h=400&fit=crop",
    genre: "Concerts",
    availability: "available",
    description: "Berlin's underground scene comes alive with DJ Nexus at the iconic Warehouse 42. A night of deep house and techno that will keep you dancing until sunrise.",
    seats: { total: 70, taken: [2, 8, 14, 22, 33, 44, 55, 66] },
  },
];

export const categories = [
  { name: "Concerts", icon: "Music", count: 42 },
  { name: "Theater", icon: "Drama", count: 18 },
  { name: "Comedy", icon: "Laugh", count: 24 },
  { name: "Festivals", icon: "PartyPopper", count: 8 },
  { name: "Sports", icon: "Trophy", count: 31 },
  { name: "Workshops", icon: "BookOpen", count: 15 },
];
