# Khalifa Management Suite

Monorepo containing the Khalifa Management System and Client Intake Form application.

## 📁 Structure

```
/Khalifa Mgmt./
├── khalifa-mgmt/              # Main management dashboard (Next.js)
│   ├── src/
│   ├── package.json
│   ├── next.config.ts
│   ├── start-dev.sh           # ⭐ Use this to start ALL services
│   └── stop-dev.sh            # ⭐ Use this to stop ALL services
│
├── intake-form-app/           # Client intake form (React + Express)
│   ├── frontend/              # React app (port 3006)
│   └── backend/               # Express API (port 4000)
│
└── README.md                  # This file
```

## 🚀 Quick Start

### Start All Services (Recommended)
```bash
cd khalifa-mgmt
./start-dev.sh
```

This starts:
- ✅ Khalifa Management: http://localhost:3005* (see note below)
- ✅ Intake Form: http://localhost:3006
- ✅ Intake API: http://localhost:4000

**\*Port Note**: Port 3000 is often occupied by Docker Model Runner. If port conflicts occur, use:
```bash
cd khalifa-mgmt
PORT=3005 npm run dev
```

### Stop All Services
```bash
cd khalifa-mgmt
./stop-dev.sh
```

---

## 📋 Service Details

### Khalifa Management Site
- **Tech**: Next.js 16, React 19, MongoDB
- **Port**: 3005 (due to Docker Model Runner on 3000)
- **Location**: `/khalifa-mgmt`
- **Start**: `PORT=3005 npm run dev`

### Intake Form Frontend
- **Tech**: React 18, Material-UI, Create React App
- **Port**: 3006
- **Location**: `/intake-form-app/frontend`
- **Start**: `npm start`

### Intake Form Backend
- **Tech**: Express.js, SQLite, Node.js
- **Port**: 4000
- **Location**: `/intake-form-app/backend`
- **Start**: `node server.js`

---

## 🔧 Configuration

Both apps support environment variables via `.env.local` files:

### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_ENV=development
```

### Backend (.env.local)
```env
PORT=4000
NODE_ENV=development
DB_PATH=./intake.db
CORS_ORIGIN=http://localhost:3006
```

See [Phase 1 Documentation](khalifa-mgmt/Intake/PHASE_1_ENV_CONFIG.md) for details.

---

## 📚 Documentation

### Refactoring Phases
- [Phase 1: Environment Configuration](khalifa-mgmt/Intake/PHASE_1_ENV_CONFIG.md) ✅ Complete
- Phase 2: Folder Restructure (in progress)
- Phase 3: MongoDB Integration (planned)
- Phase 4: Docker Setup (planned)

### Application Docs
- [Intake Form Startup Guide](khalifa-mgmt/Intake/STARTUP_GUIDE.md)
- [Intake Form Troubleshooting](khalifa-mgmt/Intake/TROUBLESHOOTING.md)

---

## 🔍 Database

- **Khalifa**: MongoDB (local or Atlas)
- **Intake Form**: SQLite (`/intake-form-app/backend/intake.db`)

### View Intake Submissions
```bash
cd intake-form-app/backend
sqlite3 intake.db "SELECT * FROM intake_forms;"
```

### Clear Intake Database
```bash
cd intake-form-app/backend
rm intake.db
node server.js  # Recreates empty database
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
lsof -iTCP -sTCP:LISTEN -n -P | grep -E "3000|3006|4000"
```

### Kill Specific Process
```bash
pkill -f "next dev"          # Kill Next.js
pkill -f "react-scripts"      # Kill React
pkill -f "node server.js"     # Kill Express
```

### Reset Everything
```bash
./khalifa-mgmt/stop-dev.sh
pkill -9 -f "node\|react\|next"  # Force kill all
./khalifa-mgmt/start-dev.sh
```

---

## 📊 Architecture

```
User Browser
    ↓
    ├→ http://localhost:3001     (Khalifa Dashboard)
    ├→ http://localhost:3006     (Intake Form Frontend)
    │   ↓
    │   → http://localhost:4000/api/intake
    │         ↓
    │      SQLite DB
```

---

## 🎯 Development Workflow

1. **Make changes** to code
2. **Services auto-reload** (Next.js, React, Node watch mode)
3. **Test in browser**
4. **Commit changes**

### Hot Reload Setup
- Next.js: Automatic ✅
- React: Automatic ✅
- Express: Manual (restart: `node server.js`)

---

## 🚀 Deployment

### Build for Production
```bash
# Khalifa
cd khalifa-mgmt && npm run build

# Intake Frontend
cd intake-form-app/frontend && npm run build

# Intake Backend
cd intake-form-app/backend && npm start (uses production node)
```

### Docker (Future)
See Phase 4 documentation for containerized deployment.

---

## 📞 Support

For questions or issues:
1. Check relevant troubleshooting docs
2. Review phase-specific documentation
3. Check application logs

---

**Last Updated**: December 18, 2025  
**Phases Complete**: Phase 1 ✅ | Phase 2 🔄 | Phase 3⏳ | Phase 4 ⏳
