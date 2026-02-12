# 🎫 Showtime228 - Event Ticketing Platform

A modern event ticketing website built with React, TypeScript, and TailwindCSS.

[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-purple)](https://vitejs.dev/)

---

## 🚀 Quick Start

### Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open browser at **http://localhost:8080**

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

---

## 📦 Deploy to AWS S3

**Complete deployment guide:** See [DEPLOY_TO_S3.md](DEPLOY_TO_S3.md)

### Quick Deploy

```bash
# 1. Build
npm run build

# 2. Deploy (requires AWS CLI)
./deploy-s3.sh your-bucket-name us-east-1
```

Your website will be live at:
```
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

---

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Navigation

---

## 📁 Project Structure

```
src/
├── pages/              # Main pages (Home, Events, Cart, etc.)
├── components/         # Reusable components
│   └── ui/            # shadcn/ui components
├── context/           # React Context (Cart state)
├── data/              # Static data (event list)
├── hooks/             # Custom hooks
└── lib/               # Utilities
```

See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for detailed structure.

---

## 🌐 Routes

- `/` - Home page
- `/events` - Events list
- `/event/:id` - Event details
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/auth` - Login/Register
- `/about` - About page
- `/contact` - Contact page

---

## 📜 Available Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # Check code
npm run test         # Run tests
npm run deploy:s3    # Deploy to S3 (requires setup)
```

---

## 📚 Documentation

- **[DEPLOY_TO_S3.md](DEPLOY_TO_S3.md)** - Complete AWS S3 deployment guide
- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Detailed project structure

---

## ✅ Project Status

- ✅ All dependencies installed (493 packages)
- ✅ Zero vulnerabilities
- ✅ Production build tested
- ✅ Ready to deploy to S3

---

## 💰 Hosting Cost

Hosting on AWS S3:
- **Small traffic:** $0.50-1.00/month
- **First year:** Often FREE (AWS Free Tier)

See [DEPLOY_TO_S3.md](DEPLOY_TO_S3.md) for details.

---

## 📞 Support

Questions? See the documentation files or create an issue.

**Happy coding! 🚀**
