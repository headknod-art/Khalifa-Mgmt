import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/TicketsNew";
import Clients from "./pages/ClientsNew";
import Contacts from "./pages/Contacts";
import RemoteSupport from "./pages/RemoteSupport";
import Analytics from "./pages/Analytics";
import Assets from "./pages/Assets";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/tickets/:id" element={<Tickets />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/remote" element={<RemoteSupport />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/assets" element={<Assets />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
