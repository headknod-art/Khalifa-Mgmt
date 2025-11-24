# Khalifa Mgmt Dashboard

## Comprehensive Asset & Trust Management Platform

This repository contains a **modern, component-based refactor** of the Khalifa Mgmt Dashboard, a platform designed for comprehensive asset and trust management. Built with React 19, Tailwind CSS 4, and TypeScript, this project provides a professional, responsive interface for streamlining operations, enhancing client relations, and delivering real-time financial insights.

**Latest Update (November 2025):** Refactored from static HTML mockup to a modern, scalable web application with enhanced design system, professional typography, and interactive components.

## 🌟 Key Features

The Khalifa Mgmt Dashboard is structured around several core modules and offers a suite of powerful features:

### Core Modules
*   **Dashboard Landing:** An executive summary providing a high-level overview of key metrics with interactive KPI cards.
*   **Client Management:** Tools for managing client accounts and tracking lead-to-client conversion.
*   **Asset Management:** Functionality for overseeing and tracking assets under management.
*   **Financial Services:** Modules dedicated to financial transactions, reporting, and portfolio performance analysis.

### Functionality Highlights
*   **Lead-to-Client Conversion Tracking:** Monitor the pipeline from prospective leads to active clients.
*   **Integrated Ticketing System:** A built-in system for managing support requests and internal tasks.
*   **Real-time Analytics:** Access to up-to-the-minute data on portfolio performance and operational metrics.
*   **Document Management:** Secure storage and organization of all client and trust-related documentation.
*   **Micro-visualizations:** Sparkline charts and progress indicators on KPI cards for quick insights.
*   **Responsive Design:** Fully responsive layout optimized for desktop, tablet, and mobile devices.

## 📊 Executive Summary Mockup Data

The dashboard mockup illustrates the following key performance indicators (KPIs):

| Metric | Value | Status |
| :--- | :--- | :--- |
| Assets Under Management (AUM) | $45.2 Million | |
| Active Trusts | 127 | |
| Client Accounts | 89 | |
| Portfolio Performance (YTD) | +12.3% | Positive |
| Pending Actions | 8 | Requires Attention |
| Compliance Status | 100% | Compliant |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation & Development

1.  Clone this repository to your local machine.
    ```bash
    git clone [REPOSITORY_URL]
    cd Khalifa-Mgmt
    ```

2.  Install dependencies.
    ```bash
    pnpm install
    ```

3.  Start the development server.
    ```bash
    pnpm dev
    ```

4.  Open your browser and navigate to `http://localhost:5173` (or the URL shown in terminal).

### Build for Production

```bash
pnpm build
pnpm preview
```

## 📁 Project Structure

```
Khalifa-Mgmt/
├── client/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page-level components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility helpers
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx          # React entry point
│   │   └── index.css         # Global styles & design tokens
│   ├── public/               # Static assets
│   └── index.html            # HTML template
├── package.json              # Dependencies & scripts
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🎨 Design System

**Color Palette:**
- **Primary:** Deep Sapphire Blue (oklch(0.5 0.15 250))
- **Secondary:** Rich Gold (oklch(0.8 0.15 70))
- **Success:** Emerald Green (oklch(0.55 0.15 142))
- **Warning:** Amber (oklch(0.65 0.18 50))

**Typography:**
- **Display:** Inter (400, 500, 600, 700)
- **Content:** Roboto (400, 500, 700)

**Theme:** Dark mode optimized for professional financial dashboards

## 🛠️ Tech Stack

- **Frontend Framework:** React 19
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Language:** TypeScript
- **Build Tool:** Vite
- **Package Manager:** pnpm
- **Icons:** Lucide React
- **Routing:** Wouter

## 📝 Development Workflow

1. Create components in `client/src/components/`
2. Build pages in `client/src/pages/`
3. Use Tailwind utilities and design tokens for styling
4. Test components in the dev server
5. Commit changes with descriptive messages

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For suggestions or feedback, please open an issue in this repository.

## 📄 License

[License information will be added here once a license is chosen for the project.]
