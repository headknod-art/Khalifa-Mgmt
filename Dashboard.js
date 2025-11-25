import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeTickets: 0,
    openSessions: 0,
    totalClients: 0,
    activeDevices: 0,
  });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");

  // Modal states
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  // Form states
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "",
    clientId: "",
  });

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  const [newSession, setNewSession] = useState({
    clientId: "",
    deviceId: "",
    notes: "",
  });

  // Helper function to format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "Unknown";
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  // Helper function to format full timestamp
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  useEffect(() => {
    fetchDashboardData();
    // Reduce refresh frequency to avoid rate limiting
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every 60 seconds instead of constantly
    return () => clearInterval(interval);
  }, []);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchWithRetry = async (fetchFn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fetchFn();
      } catch (err) {
        if (err.response?.status === 429) {
          // Rate limit error
          const waitTime = delay * Math.pow(2, i); // Exponential backoff
          console.log(`Rate limited. Waiting ${waitTime}ms before retry ${i + 1}/${retries}...`);
          if (i < retries - 1) {
            await sleep(waitTime);
            continue;
          }
        }
        throw err;
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching dashboard data...");

      // Check API health with retry
      console.log("Checking API health...");
      try {
        const healthResponse = await fetchWithRetry(() => api.health());
        console.log("Health response:", healthResponse);
        setApiStatus(healthResponse.data.status);
      } catch (healthErr) {
        console.warn("Health check failed, continuing anyway...");
        setApiStatus("degraded");
      }

      // Add small delays between requests to avoid rate limiting
      await sleep(200);

      // Fetch tickets with retry
      const ticketsResponse = await fetchWithRetry(() => api.getTickets());
      const ticketsData = ticketsResponse.data.tickets || [];
      setTickets(ticketsData);

      await sleep(200);

      // Fetch clients with retry
      const clientsResponse = await fetchWithRetry(() => api.getClients());
      const clientsData = clientsResponse.data.clients || [];

      await sleep(200);

      // Fetch remote sessions with retry
      const sessionsResponse = await fetchWithRetry(() => api.getRemoteSessions());
      const sessionsData = sessionsResponse.data.sessions || [];

      await sleep(200);

      // Fetch assets with retry
      const assetsResponse = await fetchWithRetry(() => api.getAssets());
      const assetsData = Array.isArray(assetsResponse.data) ? assetsResponse.data : (assetsResponse.data?.assets || []);

      // Calculate actual stats from database
      const activeTicketsCount = ticketsData.filter(t => t.status !== 'closed' && t.status !== 'resolved').length;
      const activeSessions = sessionsData.filter(s => s.status === 'active' || s.status === 'in_progress').length;
      const activeAssets = assetsData.filter(a => a.status === 'active').length;

      // Update stats with real data
      setStats({
        activeTickets: activeTicketsCount,
        openSessions: activeSessions,
        totalClients: clientsData.length,
        activeDevices: activeAssets,
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response,
        status: err.response?.status,
      });

      if (err.response?.status === 429) {
        setError("Too many requests. Please wait a moment and the dashboard will refresh automatically.");
      } else {
        setError(
          err.response?.data?.error?.message ||
            err.message ||
            "Failed to load dashboard data"
        );
      }
      
      setApiStatus("error");
      setLoading(false);

      // Use mock data as fallback
      setStats({
        activeTickets: 12,
        openSessions: 3,
        totalClients: 48,
        activeDevices: 156,
      });
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await api.createTicket(newTicket);
      alert("Ticket created successfully!");
      setShowTicketModal(false);
      setNewTicket({
        title: "",
        description: "",
        priority: "medium",
        category: "",
        clientId: "",
      });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert(
        "Failed to create ticket: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      await api.createClient(newClient);
      alert("Client created successfully!");
      setShowClientModal(false);
      setNewClient({
        name: "",
        email: "",
        phone: "",
        company: "",
      });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error creating client:", error);
      alert(
        "Failed to create client: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    try {
      const response = await api.startRemoteSession(newSession);
      alert("Remote session started successfully!");
      setShowSessionModal(false);
      setNewSession({
        clientId: "",
        deviceId: "",
        notes: "",
      });
      fetchDashboardData(); // Refresh data
      // Optionally open session URL
      if (response.data.sessionUrl) {
        window.open(response.data.sessionUrl, "_blank");
      }
    } catch (error) {
      console.error("Error starting session:", error);
      alert(
        "Failed to start session: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <div>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h2>🏠 Dashboard</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ 
            fontSize: '13px', 
            color: '#666',
            padding: '8px 12px',
            background: '#f5f5f5',
            borderRadius: '6px'
          }}>
            👤 {user?.email || "Guest User"}
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={logout}
            style={{ padding: '8px 16px' }}
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '6px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#856404'
        }}>
          <span>⚠️ {error}</span>
          <button
            onClick={fetchDashboardData}
            className="btn btn-primary"
            style={{
              padding: "6px 12px",
              fontSize: '13px'
            }}
          >
            🔄 Retry
          </button>
        </div>
      )}

      {loading && <div className="loading">Loading dashboard data...</div>}

      {/* Key Metrics with Gradient Backgrounds */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: '500' }}>Active Tickets</div>
              <div style={{ fontSize: '42px', fontWeight: 'bold', lineHeight: '1' }}>{stats.activeTickets}</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>Tickets needing attention</div>
            </div>
            <span style={{ fontSize: "64px", opacity: 0.3 }}>🎫</span>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: '500' }}>Remote Sessions</div>
              <div style={{ fontSize: '42px', fontWeight: 'bold', lineHeight: '1' }}>{stats.openSessions}</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>Active support sessions</div>
            </div>
            <span style={{ fontSize: "64px", opacity: 0.3 }}>🖥️</span>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: '500' }}>Total Clients</div>
              <div style={{ fontSize: '42px', fontWeight: 'bold', lineHeight: '1' }}>{stats.totalClients}</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>Managed clients</div>
            </div>
            <span style={{ fontSize: "64px", opacity: 0.3 }}>👥</span>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: '500' }}>Active Assets</div>
              <div style={{ fontSize: '42px', fontWeight: 'bold', lineHeight: '1' }}>{stats.activeDevices}</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>Devices under management</div>
            </div>
            <span style={{ fontSize: "64px", opacity: 0.3 }}>💻</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>📋 Recent Tickets</h3>
          {tickets.length > 0 ? (
            <div>
              {tickets.slice(0, 5).map((ticket) => {
                const priorityColors = {
                  critical: '#d32f2f',
                  high: '#f44336',
                  medium: '#FF9800',
                  low: '#4CAF50'
                };
                const statusColors = {
                  open: '#2196F3',
                  in_progress: '#FF9800',
                  pending: '#FFC107',
                  resolved: '#4CAF50',
                  closed: '#757575'
                };
                
                return (
                  <div 
                    key={ticket.id}
                    onClick={() => navigate('/tickets')}
                    style={{ 
                      padding: '15px',
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderRadius: '4px',
                      marginBottom: '8px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <strong style={{ flex: 1, fontSize: '14px' }}>{ticket.title}</strong>
                      <span style={{ 
                        backgroundColor: priorityColors[ticket.priority] || '#999',
                        color: 'white',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        marginLeft: '10px'
                      }}>
                        {ticket.priority || "Medium"}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: '6px' }}>
                      🏢 {ticket.client_name || "No client assigned"}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px' }}>
                      <span style={{ 
                        backgroundColor: statusColors[ticket.status] || '#999',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontWeight: '500'
                      }}>
                        {ticket.status?.replace('_', ' ') || 'Open'}
                      </span>
                      <span style={{ color: "#999" }}>•</span>
                      <span style={{ color: "#666" }}>
                        {formatRelativeTime(ticket.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/tickets")}
(Content truncated due to size limit. Use page ranges or line ranges to read remaining content)