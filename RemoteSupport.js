import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../App.css';

function RemoteSupport() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const [clients, setClients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Screen sharing state
  const [isSharing, setIsSharing] = useState(false);
  const [stream, setStream] = useState(null);
  const [shareMode, setShareMode] = useState('screen'); // 'screen' or 'camera'
  
  // Camera/video devices
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  
  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Form
  const [inviteForm, setInviteForm] = useState({
    clientId: '',
    clientName: '',
    clientEmail: '',
    ticketId: ''
  });

  // Stats
  const [stats, setStats] = useState({
    todaySessions: 0,
    avgDuration: 0,
    totalTime: 0
  });

  useEffect(() => {
    fetchData();
    // Don't enumerate devices on load - wait for user to click camera button
    
    // Check if client ID is in URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('client');
    if (clientId) {
      // Pre-select client and open invite modal
      setTimeout(() => {
        const client = clients.find(c => c.id === parseInt(clientId));
        if (client) {
          setInviteForm({
            clientId: client.id,
            clientName: client.name,
            clientEmail: client.email || '',
            ticketId: ''
          });
          setShowInviteModal(true);
        }
      }, 500); // Small delay to ensure clients are loaded
    }
    
    const interval = setInterval(fetchData, 60000); // Increased to 60 seconds to reduce rate limiting
    return () => clearInterval(interval);
  }, [clients]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchData = async () => {
    try {
      // Fetch sequentially with delay to avoid rate limiting
      const clientsRes = await api.getClients();
      await sleep(300);
      const sessionsRes = await api.getRemoteSessions();
      
      const clientsData = Array.isArray(clientsRes.data) 
        ? clientsRes.data 
        : (clientsRes.data?.data || []);
      
      const sessionsData = Array.isArray(sessionsRes.data)
        ? sessionsRes.data
        : (sessionsRes.data?.data || []);
      
      setClients(clientsData);
      setSessions(sessionsData);
      
      // Calculate stats
      const today = new Date().toDateString();
      const todaySessions = sessionsData.filter(s => 
        new Date(s.started_at).toDateString() === today
      );
      const completedToday = todaySessions.filter(s => s.status === 'completed');
      const totalDuration = completedToday.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
      const avgDuration = completedToday.length > 0 ? Math.floor(totalDuration / completedToday.length) : 0;
      
      setStats({
        todaySessions: todaySessions.length,
        avgDuration,
        totalTime: totalDuration
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response?.status === 429) {
        console.warn('Rate limited. Will retry on next interval.');
      }
      // Don't clear data on error, keep showing existing data
      if (!clients.length && !sessions.length) {
        setClients([]);
        setSessions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const enumerateVideoDevices = async () => {
    console.log('📋 Enumerating all media devices...');
    
    // Just enumerate what we already have access to from the test
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    const videoInputs = devices.filter(device => device.kind === 'videoinput');
    const audioInputs = devices.filter(device => device.kind === 'audioinput');
    
    console.log('📹 Video inputs:', videoInputs);
    console.log('🎤 Audio inputs:', audioInputs);
    
    setVideoDevices(videoInputs);
    setAudioDevices(audioInputs);
    
    if (videoInputs.length > 0) {
      setSelectedDevice(videoInputs[0].deviceId);
    }
    if (audioInputs.length > 0) {
      setSelectedAudioDevice(audioInputs[0].deviceId);
    }
  };

  const startScreenShare = async () => {
    try {
      console.log('Requesting screen share with audio...');
      
      // Request screen sharing with system audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          cursor: 'always',