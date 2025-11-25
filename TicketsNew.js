import { useParams } from "react-router-dom";
import api from "../services/api";
import "../App.css";

function Tickets() {
  const { id } = useParams();
  
  // State management
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTicket, setEditedTicket] = useState({});
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    category: "all",
    assignedTo: "all",
    search: "",
  });

  // New ticket form
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "",
    clientId: "",
    assignedTo: "",
    dueDate: "",
  });

  // Comment form
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  // Fetch tickets and stats
  useEffect(() => {
    fetchTickets();
    fetchStats();
    fetchClients();
    fetchUsers();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets, filters]);

  // Handle URL parameter for direct ticket access
  useEffect(() => {
    if (id && tickets.length > 0) {
      fetchTicketDetails(parseInt(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, tickets]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.getTickets();
      setTickets(response.data.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      alert("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getTicketStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.getClients();
      setClients(response.data.clients || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      // TODO: Add users endpoint to API
      setUsers([
        { id: 1, first_name: "System", last_name: "User" }
      ]);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await api.getTicket(ticketId);
      setSelectedTicket(response.data);
      setEditedTicket(response.data);
      setEditMode(false);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      alert("Failed to load ticket details");
    }
  };

  const applyFilters = () => {
    let filtered = [...tickets];

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== "all") {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    // Assigned filter
    if (filters.assignedTo !== "all") {
      if (filters.assignedTo === "unassigned") {
        filtered = filtered.filter((t) => !t.assigned_to);
      } else {
        filtered = filtered.filter((t) => t.assigned_to === parseInt(filters.assignedTo));
      }
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.ticket_number.toLowerCase().includes(searchLower) ||
          (t.description && t.description.toLowerCase().includes(searchLower)) ||
          (t.client_name && t.client_name.toLowerCase().includes(searchLower))
      );
    }

    setFilteredTickets(filtered);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();

    if (!newTicket.title) {
      alert("Please enter a ticket title");
      return;
    }

    try {
      await api.createTicket(newTicket);
      alert("Ticket created successfully!");
      setShowCreateModal(false);
      setNewTicket({
        title: "",
        description: "",
        priority: "medium",
        category: "",
        clientId: "",
        assignedTo: "",
        dueDate: "",
      });
      fetchTickets();
      fetchStats();
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("Failed to create ticket");
    }
  };

  const handleSaveTicketEdits = async () => {
    try {
      const updates = {
        title: editedTicket.title,
        description: editedTicket.description,
        priority: editedTicket.priority,
        status: editedTicket.status,