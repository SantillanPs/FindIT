# FindIT: Institutional Asset Recovery Protocol

FindIT is a high-performance, community-driven asset recovery platform designed for modern university environments. Built with a **Supabase-native architecture**, it eliminates legacy backend overhead to provide real-time sighted intelligence, semantic item matching, and secure recovery workflows.

## 🚀 Key Features

- **Semantic Matchmaker**: Leveraging `pgvector` for high-speed similarity search between lost and found assets.
- **Communal Recovery Network**: Real-time witness reporting and sighting verification protocols.
- **Administrative Command Center**: Comprehensive analytics, staff management, and automated claim adjudication.
- **Secure Asset Vault**: Encrypted personal inventory management for student assets.
- **Zero-Latency Interface**: Built with React + Vite and Framer Motion for a premium, responsive experience.

## 🛠️ Technology Stack

- **Core**: React 19, Vite 7
- **Database**: Supabase (PostgreSQL with `pgvector`)
- **Storage**: Supabase Storage
- **Logic**: Supabase PL/pgSQL RPCs
- **Styling**: Vanilla CSS, Shadcn UI, Lucide Icons
- **Animation**: Framer Motion

## 📦 Getting Started

### Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Installation
```bash
npm install
```

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

## 🏗️ Architecture Note

This project is fully **Supabase-native**. All legacy Python/FastAPI components have been decommissioned. Matching logic and data aggregation are now handled directly by Supabase RPCs, ensuring maximum efficiency and simplified deployment.

---
FindIT Registry &bull; Institutional Asset Recovery &bull; &copy; 2026
