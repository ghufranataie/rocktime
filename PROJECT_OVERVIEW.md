# Showtime228 - Project Structure Guide

This is a simple guide to help you understand how this project works.

---

## 🎯 What is this app?

This is a **ticket booking website** for events (concerts, theater, comedy shows). Users can:
- Browse events
- Select seats
- Add tickets to cart
- Checkout and pay

---

## 📁 Project Structure (Simple View)

```
showtime228/
├── src/                    ← All main code is here
│   ├── pages/              ← Website pages (what user sees)
│   ├── components/         ← Reusable building blocks
│   ├── context/            ← Shared data (like shopping cart)
│   ├── data/               ← Static information (event list)
│   ├── hooks/              ← Helper functions for React
│   └── lib/                ← Utility functions
├── public/                 ← Static files (images, icons)
└── index.html              ← Entry point for the browser
```

---

## 📄 Pages (What User Sees)

Location: `src/pages/`

| File | URL | What it does |
|------|-----|--------------|
| `Index.tsx` | `/` | **Home page** - First page users see |
| `Events.tsx` | `/events` | **All events list** - Shows all available events |
| `EventDetail.tsx` | `/event/:id` | **Single event page** - Shows event details + seat selection |
| `Cart.tsx` | `/cart` | **Shopping cart** - Shows selected tickets |
| `Checkout.tsx` | `/checkout` | **Payment page** - User enters payment info |
| `Auth.tsx` | `/auth` | **Login/Register page** - User authentication |
| `About.tsx` | `/about` | **About us page** - Information about the company |
| `Contact.tsx` | `/contact` | **Contact page** - Contact form |
| `NotFound.tsx` | `/*` | **404 page** - Shows when page not found |

---

## 🧩 Components (Reusable Parts)

Location: `src/components/`

### Main Components

| File | What it does |
|------|--------------|
| `Navbar.tsx` | **Navigation bar** at top of every page |
| `Footer.tsx` | **Footer** at bottom of every page |
| `EventCard.tsx` | **Card** showing one event (image, title, price) |
| `NavLink.tsx` | **Link** item in navigation menu |

### UI Components

Location: `src/components/ui/`

This folder has **49 small components** like:
- `button.tsx` - Buttons
- `input.tsx` - Text inputs
- `card.tsx` - Card containers
- `dialog.tsx` - Popup windows
- `toast.tsx` - Notification messages
- `form.tsx` - Form elements
- And many more...

> 💡 These are from **shadcn/ui** library - ready-made beautiful components

---

## 🛒 Context (Shared Data)

Location: `src/context/`

| File | What it does |
|------|--------------|
| `CartContext.tsx` | **Shopping cart logic** - Stores selected tickets, can add/remove items, calculates total price |

**How it works:**
- User selects seats on event page
- Seats are saved to cart (using `addItem`)
- Cart page shows all selected tickets
- Checkout uses cart data for payment

---

## 📊 Data (Static Information)

Location: `src/data/`

| File | What it does |
|------|--------------|
| `events.ts` | **List of all events** - Contains concert/theater/comedy show information (title, artist, date, price, venue, seats) |

> 📝 Note: This is **dummy data** for demo. In real app, this would come from a server/database.

---

## 🪝 Hooks (Helper Functions)

Location: `src/hooks/`

| File | What it does |
|------|--------------|
| `use-mobile.tsx` | Checks if user is on mobile device |
| `use-toast.ts` | Shows notification messages to user |

---

## 🔧 Lib (Utilities)

Location: `src/lib/`

| File | What it does |
|------|--------------|
| `utils.ts` | Small helper functions (like combining CSS classes) |

---

## 🚀 App.tsx (Main File)

Location: `src/App.tsx`

This file:
1. Sets up **routing** (which URL shows which page)
2. Wraps everything with **CartProvider** (so cart works everywhere)
3. Shows **Navbar** on top
4. Shows **Footer** on bottom
5. Shows page content in the middle

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React** | Main framework for building the app |
| **TypeScript** | JavaScript with types (safer code) |
| **Vite** | Build tool (makes development fast) |
| **TailwindCSS** | CSS styling (makes things look nice) |
| **React Router** | Page navigation |
| **shadcn/ui** | Pre-built UI components |
| **TanStack Query** | Data fetching (for future API calls) |

---

## 🎨 How Styling Works

- Uses **TailwindCSS** - write styles directly in HTML classes
- Example: `className="text-white bg-blue-500 p-4"`
- Colors and themes defined in `tailwind.config.ts`

---

## 📱 Important Files at Root

| File | What it does |
|------|--------------|
| `package.json` | List of all dependencies + scripts |
| `index.html` | Main HTML file |
| `vite.config.ts` | Vite settings |
| `tailwind.config.ts` | TailwindCSS settings |
| `tsconfig.json` | TypeScript settings |

---

## 🏃 How to Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📝 Quick Summary

1. **User opens website** → sees `Index.tsx` (home page)
2. **User clicks "Events"** → sees `Events.tsx` (list of events)
3. **User clicks event card** → sees `EventDetail.tsx` (event details + seats)
4. **User selects seats** → seats saved to `CartContext`
5. **User clicks cart icon** → sees `Cart.tsx` (their tickets)
6. **User clicks checkout** → sees `Checkout.tsx` (payment form)
7. **User submits payment** → done! 🎉

---

**Happy coding! 🚀**
