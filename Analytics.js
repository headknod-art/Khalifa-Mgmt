import api from '../services/api';
import '../App.css';

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days'); // 24hours, 7days, 30days, all
  const [chartView, setChartView] = useState('overview'); // overview, trends, distributions
  const [data, setData] = useState({
    tickets: [],
    clients: [],
    contacts: [],
    assets: [],
    sessions: []
  });
  
  const [stats, setStats] = useState({
    // Ticket metrics
    totalTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    avgResolutionTime: 0,
    ticketsByPriority: {},
    ticketsByCategory: {},
    ticketsByStatus: {},
    
    // Client metrics
    totalClients: 0,
    activeClients: 0,
    newClientsThisPeriod: 0,
    clientsWithTickets: 0,
    
    // Contact metrics
    totalContacts: 0,
    contactsByStatus: {},
    conversionRate: 0,
    
    // Asset metrics
    totalAssets: 0,
    assetsByType: {},
    assetsByStatus: {},
    
    // Remote support metrics
    totalSessions: 0,
    avgSessionDuration: 0,
    sessionsToday: 0,
    totalSupportTime: 0,
    
    // Activity metrics
    busyHours: [],
    topClients: [],
    recentActivity: [],
    
    // Trend data
    ticketTrend: [],
    clientTrend: [],
    sessionTrend: [],
    dailyActivity: {}
  });

  useEffect(() => {
    fetchAllData();
  }, [timeRange]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch sequentially with delays to avoid rate limiting
      console.log('Fetching analytics data...');
      
      const ticketsRes = await api.getTickets();
      await sleep(300);
      
      const clientsRes = await api.getClients();
      await sleep(300);
      
      const contactsRes = await api.getContacts();
      await sleep(300);
      
      const assetsRes = await api.getAssets();
      await sleep(300);
      
      const sessionsRes = await api.getRemoteSessions();

      // Extract data correctly based on each API's response format
      const ticketsData = ticketsRes.data?.tickets || [];
      const clientsData = clientsRes.data?.clients || [];
      const contactsData = Array.isArray(contactsRes.data) ? contactsRes.data : (contactsRes.data?.contacts || []);
      const assetsData = assetsRes.data?.assets || [];
      const sessionsData = sessionsRes.data?.sessions || [];

      console.log('Analytics Data Loaded:', {
        tickets: ticketsData.length,
        clients: clientsData.length,
        contacts: contactsData.length,
        assets: assetsData.length,
        sessions: sessionsData.length
      });