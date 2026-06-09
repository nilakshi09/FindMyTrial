<div align="center">

# 🔬 FindMyTrial

**Clinical trial matching in plain English.**

Find actively recruiting clinical trials that match your condition — no jargon, no expertise required.

[![Live Demo](https://img.shields.io/badge/demo-findmytrial.com-C8922A?style=for-the-badge&logo=google-chrome&logoColor=white)](https://findmytrial.com)
[![Next.js](https://img.shields.io/badge/Next.js-13-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](./LICENSE)

</div>

---

## ✨ What is FindMyTrial?

Most clinical trial registries are built for researchers — dense, jargon-heavy, and nearly impossible for patients to navigate. **FindMyTrial** changes that.

Type your condition in plain English. We query [ClinicalTrials.gov](https://clinicaltrials.gov) in real time, filter for actively recruiting trials, and present results anyone can understand — in seconds.

### Key Features

- 🔍 **Plain English Search** — Describe your situation in your own words
- ⚡ **Real-Time Results** — Live data from 470,000+ registered trials
- 📋 **Simplified Summaries** — Every result rewritten for non-experts
- 📍 **Location Aware** — See trials recruiting near you
- 🆓 **100% Free** — No accounts, no paywalls, no hidden costs

---

## 🏗️ Project Structure

This is a monorepo with a clear separation between frontend and backend:

```
FindMyTrial/
├── frontend/             # Next.js 13 app (UI, components, styles)
│   ├── app/              # App Router pages & API routes
│   ├── components/       # React components + shadcn/ui
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utility functions
│
├── backend/              # Express.js API server
│   └── src/
│       ├── routes/       # API endpoints
│       ├── utils/        # NLP & text processing
│       └── types/        # TypeScript interfaces
│
└── README.md             # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** 9+

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/FindMyTrial.git
cd FindMyTrial
```

### 2. Start the Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The app will be live at **http://localhost:3000**

### 3. Start the Backend (optional — frontend has a built-in API route)

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API will be live at **http://localhost:3001**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 13, React 18, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui, Radix UI |
| **Backend** | Express.js, Node.js, TypeScript |
| **Data Source** | ClinicalTrials.gov API v2 |
| **Fonts** | Inter + Playfair Display (Google Fonts) |
| **Deployment** | Netlify |

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/search?q=<query>` | Search for recruiting clinical trials |
| `GET` | `/api/health` | Health check (backend only) |

**Example:**
```bash
curl "http://localhost:3000/api/search?q=stage+2+lupus"
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

## ⚠️ Disclaimer

FindMyTrial is **not** a medical provider. Always discuss clinical trial participation with your physician. All trial data is sourced from [ClinicalTrials.gov](https://clinicaltrials.gov) and is provided as-is.

---

<div align="center">

**Built with ❤️ for patients who deserve better access to clinical trials.**

</div>
