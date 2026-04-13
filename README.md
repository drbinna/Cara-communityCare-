# 🩺 Cara — CommunityCare Virtual Receptionist

**Cara** is a 24/7 AI-powered voice receptionist built for [CommunityCare HMO, Inc.](https://communitycareok.com) (Tulsa, Oklahoma). Members can call Cara directly from their browser to get help with insurance questions, find a doctor, or have their requests routed to the right team — no hold music required.

🔗 **Live demo:** [cara-community-care.vercel.app](https://cara-community-care.vercel.app)

---

## Features

- **Voice-first interface** — Real-time phone-style conversations powered by [Retell AI](https://www.retellai.com/).
- **Multilingual support** — English, Spanish, and 12+ additional languages.
- **Always on** — Available around the clock for member inquiries.
- **Call lifecycle UI** — Visual call states including connecting, active, muted, and post-call summary.
- **Quick links** — One-click access to CommunityCare's doctor finder and member portal.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla JS + CSS, bundled with **Vite** |
| Backend | **Express 5** (Node.js) |
| Voice AI | **Retell AI** (`retell-sdk` + `retell-client-js-sdk`) |
| Hosting | **Vercel** (frontend + serverless API routes) |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A **Retell AI** account and API key

### Installation

```bash
# Clone the repo
git clone https://github.com/drbinna/Cara-communityCare-.git
cd Cara-communityCare-

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
RETELL_API_KEY=your_retell_api_key_here
```

### Running Locally

```bash
# Start both frontend and backend concurrently
npm run dev:all
```

This launches the Vite dev server (frontend) and the Express server (backend) side by side.

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite frontend only |
| `npm run server` | Start Express backend only |
| `npm run dev:all` | Start both concurrently |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

---

## Project Structure

```
Cara-communityCare-/
├── api/              # Vercel serverless API routes
├── public/           # Static assets (avatar, icons)
├── src/              # Frontend source (JS, CSS)
├── server.js         # Express backend (local dev)
├── index.html        # App entry point
├── vercel.json       # Vercel deployment config
└── package.json
```

---

## Deployment

The app is configured for **Vercel** out of the box. Push to `main` and Vercel will build and deploy automatically. Make sure to add `RETELL_API_KEY` to your Vercel project's environment variables.
