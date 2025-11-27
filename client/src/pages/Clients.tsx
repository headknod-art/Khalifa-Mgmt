import { useEffect, useRef, useState } from "react";

type Client = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: string;
};

type ClientForm = Omit<Client, "id">;
export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<ClientForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    status: "Active"
  });
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All"|"Active"|"Inactive">("All");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [showConfirm, setShowConfirm] = useState<{ open: boolean; index: number | null }>({ open: false, index: null });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const modalFirstRef = useRef<HTMLInputElement | null>(null);

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  // Placeholder for API/database integration
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // simple client-side validation
    setError(null);
    // validate all fields and set per-field errors
    const newFieldErrors: Record<string, string> = {};
    const validateField = (name: string, value: string) => {
      switch (name) {
        case 'name':
          if (!value.trim()) return 'Name is required';
          return '';
        case 'email':
          if (!/^\S+@\S+\.\S+$/.test(value)) return 'Enter a valid email';
          return '';
        case 'phone': {
          const digits = value.replace(/\D/g, '');
          if (digits.length < 7) return 'Enter a valid phone number';
          return '';
        }
        case 'zip':
          if (value && !/^\d{3,10}(-\d+)?$/.test(value)) return 'Enter a valid ZIP/postal code';
          return '';
        default:
          return '';
      }
    };

    Object.entries(form).forEach(([k, v]) => {
      const err = validateField(k, String(v || ''));
      if (err) newFieldErrors[k] = err;
    });

    setFieldErrors(newFieldErrors);
    if (Object.keys(newFieldErrors).length > 0) {
      setSubmitting(false);
      // focus first invalid field
      const firstKey = Object.keys(newFieldErrors)[0];
      const el = document.querySelector<HTMLInputElement>(`input[name="${firstKey}"]`);
      el?.focus();
      return;
    }

    // Persist to server (POST or PUT). If server fails, show error and keep UI unchanged.
    try {
      if (editingIndex !== null && clients[editingIndex]) {
        const id = clients[editingIndex].id;
        const res = await fetch(`/api/v1/clients/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to update client');
        const updated = await res.json();
        setClients(prev => prev.map(c => (c.id === id ? { ...c, ...updated } : c)));
      } else {
        setLastSaved(new Date().toISOString());
        const res = await fetch('/api/v1/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        setFieldErrors({});
        if (!res.ok) throw new Error('Failed to create client');
        const created = await res.json();
        setClients(prev => [{ id: created.id ?? Date.now(), name: created.name, email: created.email, phone: created.phone || '', address: created.address || '', city: created.city || '', state: created.state || '', zip: created.zip || '', status: created.status || 'Active' }, ...prev]);
      }
      // reset
      setForm({ name: "", email: "", phone: "", address: "", city: "", state: "", zip: "", status: "Active" });
      setShowModal(false);
      setEditingIndex(null);
    } catch (err) {
      console.error(err);
      setError('Failed to save client. Check server connection.');
    } finally {
      setSubmitting(false);
    }
  };

  // helper: validate a single field on change/blur
  const validateSingle = (name: string, value: string) => {
    let msg = '';
    switch (name) {
      case 'name':
        if (!value.trim()) msg = 'Name is required';
        break;
      case 'email':
        if (!/^\S+@\S+\.\S+$/.test(value)) msg = 'Enter a valid email';
        break;
      case 'phone': {
        const digits = value.replace(/\D/g, '');
        if (digits.length < 7) msg = 'Enter a valid phone number';
        break;
      }
      function validateEmail(v: string) {
        return /\S+@\S+\.\S+/.test(v);
      }

      function validatePhone(v: string) {
        if (!v) return false;
        const digits = v.replace(/\D/g, '');
        return digits.length >= 7 && digits.length <= 15;
      }

      function validateZip(v: string) {
        return /^\d{4,10}$/.test(v);
      }

      function validateSingle(field: string, value: string) {
        let msg = '';
        if (field === 'name') {
          if (!value || value.trim().length < 2) msg = 'Name must be at least 2 characters.';
        }
        if (field === 'email') {
          if (!validateEmail(value)) msg = 'Provide a valid email address.';
        }
        if (field === 'phone') {
          if (!validatePhone(value)) msg = 'Provide a valid phone number.';
        }
        if (field === 'zip') {
          if (!validateZip(value)) msg = 'ZIP must be numeric and 4–10 digits.';
        }
        setFieldErrors(fe => ({ ...fe, [field]: msg }));
        return !msg;
      }

      function validateAll() {
        const okName = validateSingle('name', form.name);
        const okEmail = validateSingle('email', form.email);
        const okPhone = validateSingle('phone', form.phone);
        const okZip = validateSingle('zip', form.zip);
        return okName && okEmail && okPhone && okZip;
      }

      function formatPhone(v: string) {
        if (!v) return v;
        const d = v.replace(/\D/g, '');
        if (d.length <= 3) return d;
        if (d.length <= 6) return `${d.slice(0,3)}-${d.slice(3)}`;
        return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6,10)}`;
      }
      case 'zip':
        if (value && !/^\d{3,10}(-\d+)?$/.test(value)) msg = 'Enter a valid ZIP/postal code';
        break;
    }
    setFieldErrors(prev => ({ ...prev, [name]: msg }));
    return msg;
  };

  const formatPhone = (val: string) => {
    const d = val.replace(/\D/g, '');
    if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
    if (d.length === 7) return `${d.slice(0,3)}-${d.slice(3)}`;
    return val;
  };

  // Load clients from server; fall back to localStorage if server is unavailable
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/v1/clients');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data)) {
          setClients(data.map((d: any) => ({ id: d.id ?? d.ID ?? Date.now(), name: d.name || '', email: d.email || '', phone: d.phone || '', address: d.address || '', city: d.city || '', state: d.state || '', zip: d.zip || '', status: d.status || 'Active' })));
          return;
        }
      } catch (err) {
        try {
          const raw = localStorage.getItem('clients');
          if (raw) setClients(JSON.parse(raw));
        } catch (e) {
          console.warn('Failed to load clients from server and localStorage', e);
        }
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("clients", JSON.stringify(clients));
      setLastSaved(new Date());
    } catch (e) {}
  }, [clients]);

  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleExport = () => {
    const data = JSON.stringify(clients, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fileRef = useRef<HTMLInputElement | null>(null);
  const handleImportClick = () => fileRef.current?.click();
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (Array.isArray(parsed)) {
          setClients(parsed as Client[]);
        } else {
          alert("Invalid file format: expected an array of clients");
        }
      } catch (err) {
        alert("Failed to parse file: " + String(err));
      }
    };
    reader.readAsText(f);
  };

  const handleResetStorage = () => {
    if (!confirm("Clear all saved clients from local storage?")) return;
    localStorage.removeItem("clients");
    setClients([]);
  };

  useEffect(() => {
    if (showModal && modalFirstRef.current) modalFirstRef.current.focus();
  }, [showModal]);

  const handleEditClient = (idx: number) => {
    const c = clients[idx];
    setForm({ name: c.name, email: c.email, phone: c.phone, address: c.address, city: c.city, state: c.state, zip: c.zip, status: c.status });
    setEditingIndex(idx);
    setShowModal(true);
  };

  const handleRemoveClient = (idx: number) => {
    // show confirm modal
    setShowConfirm({ open: true, index: idx });
  };

  const confirmRemove = () => {
    if (showConfirm.index === null) return;
    const idx = showConfirm.index;
    const client = clients[idx];
    if (!client) {
      setShowConfirm({ open: false, index: null });
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/v1/clients/${client.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        setClients(prev => prev.filter((_, i) => i !== idx));
      } catch (err) {
        console.error(err);
        setError('Failed to delete client.');
      } finally {
        setShowConfirm({ open: false, index: null });
      }
    })();
  };

  const cancelRemove = () => setShowConfirm({ open: false, index: null });

  const filtered = clients.filter(c => {
    const q = query.trim().toLowerCase();
    if (q) {
      if (!(c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))) return false;
    }
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-10 tracking-tight">Client Management</h1>
      <div className="bg-card border border-border rounded-3xl shadow-2xl p-12 max-w-6xl mx-auto transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full sm:w-auto mb-3 sm:mb-0">
            <h2 className="text-2xl font-semibold tracking-tight">Clients</h2>
            <div className="text-sm text-muted-foreground">Manage your clients — add, edit, or remove entries.</div>
          </div>
          <div className="flex gap-3 items-center w-full sm:w-auto">
            <input
              aria-label="Search clients" 
              placeholder="Search by name or email"
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-border rounded-lg w-full sm:w-64"
            />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }}
              className="px-3 py-2 border border-border rounded-lg"
              aria-label="Filter by status"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-lg font-semibold shadow hover:bg-primary/90 transition-colors"
              type="button"
              onClick={() => { setEditingIndex(null); setForm({ name: "", email: "", phone: "", address: "", city: "", state: "", zip: "", status: "Active" }); setShowModal(true); }}
            >
              Add Client
            </button>
            <div className="ml-2 flex items-center gap-2">
              <button onClick={handleExport} className="px-3 py-2 border rounded text-sm">Export</button>
              <input ref={fileRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
              <button onClick={handleImportClick} className="px-3 py-2 border rounded text-sm">Import</button>
              <button onClick={handleResetStorage} className="px-3 py-2 border rounded text-sm">Reset</button>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <div className="text-xs text-muted-foreground">{lastSaved ? `Saved ${lastSaved.toLocaleString()}` : "No saved data yet"}</div>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-muted-foreground text-lg mb-6">No clients found.</div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded" onClick={() => { setShowModal(true); setEditingIndex(null); }}>Add your first client</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-lg rounded-2xl overflow-hidden shadow-md">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="py-4 px-6 font-bold">Name</th>
                  <th className="py-4 px-6 font-bold">Email</th>
                  <th className="py-4 px-6 font-bold">Phone</th>
                  <th className="py-4 px-6 font-bold">Address</th>
                  <th className="py-4 px-6 font-bold">City</th>
                  <th className="py-4 px-6 font-bold">State</th>
                  <th className="py-4 px-6 font-bold">ZIP</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                  <th className="py-4 px-6 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((client, idx) => {
                  const globalIndex = (page - 1) * perPage + idx;
                  return (
                  <tr key={client.id} className="border-b border-border hover:bg-primary/10 transition-colors duration-200">
                    <td className="py-4 px-6 whitespace-nowrap">{client.name}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{client.email}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{client.phone}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{client.address}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{client.city}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{client.state}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{client.zip}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{client.status}</td>
                    <td className="py-4 px-6 flex gap-3 justify-center">
                      <button
                        className="px-3 py-1.5 rounded bg-yellow-100 text-yellow-800 text-sm font-semibold hover:bg-yellow-200 focus:ring-2 focus:ring-yellow-400 transition-all duration-150"
                        onClick={() => handleEditClient(globalIndex)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1.5 rounded bg-red-100 text-red-800 text-sm font-semibold hover:bg-red-200 focus:ring-2 focus:ring-red-400 transition-all duration-150"
                        onClick={() => handleRemoveClient(globalIndex)}
                        type="button"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">Showing {Math.min(filtered.length, (page-1)*perPage+1)}–{Math.min(page*perPage, filtered.length)} of {filtered.length}</div>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 border rounded" disabled={page===1}>Prev</button>
                <div className="px-3 py-1 border rounded">{page} / {totalPages}</div>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} className="px-3 py-1 border rounded" disabled={page===totalPages}>Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-lg relative">
            <button
              className="absolute top-3 right-3 text-xl text-muted-foreground hover:text-foreground"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6">{editingIndex !== null ? "Edit Client" : "Add Client"}</h2>
            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
            <form onSubmit={handleAddClient} className="space-y-5">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  name="name"
                  ref={modalFirstRef}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none ${fieldErrors.name ? 'border-red-400 focus:ring-red-200' : 'border-border focus:ring-2 focus:ring-primary'}`}
                  type="text"
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); validateSingle('name', e.target.value); }}
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? 'err-name' : undefined}
                  required
                />
                {fieldErrors.name && <div id="err-name" className="text-sm text-red-600 mt-1">{fieldErrors.name}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  name="email"
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none ${fieldErrors.email ? 'border-red-400 focus:ring-red-200' : 'border-border focus:ring-2 focus:ring-primary'}`}
                  type="email"
                  value={form.email}
                  onChange={e => { setForm(f => ({ ...f, email: e.target.value })); validateSingle('email', e.target.value); }}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'err-email' : undefined}
                  required
                />
                {fieldErrors.email && <div id="err-email" className="text-sm text-red-600 mt-1">{fieldErrors.email}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Phone Number</label>
                <input
                  name="phone"
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none ${fieldErrors.phone ? 'border-red-400 focus:ring-red-200' : 'border-border focus:ring-2 focus:ring-primary'}`}
                  type="tel"
                  value={form.phone}
                  onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); validateSingle('phone', e.target.value); }}
                  onBlur={e => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
                  aria-invalid={!!fieldErrors.phone}
                  aria-describedby={fieldErrors.phone ? 'err-phone' : undefined}
                  required
                />
                {fieldErrors.phone && <div id="err-phone" className="text-sm text-red-600 mt-1">{fieldErrors.phone}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Address</label>
                <input
                  className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  type="text"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1 font-medium">City</label>
                  <input
                    className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    type="text"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-medium">State</label>
                  <input
                    className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    type="text"
                    value={form.state}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-medium">ZIP Code</label>
                  <input
                    name="zip"
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none ${fieldErrors.zip ? 'border-red-400 focus:ring-red-200' : 'border-border focus:ring-2 focus:ring-primary'}`}
                    type="text"
                    value={form.zip}
                    onChange={e => { setForm(f => ({ ...f, zip: e.target.value })); validateSingle('zip', e.target.value); }}
                    aria-invalid={!!fieldErrors.zip}
                    aria-describedby={fieldErrors.zip ? 'err-zip' : undefined}
                    required
                  />
                  {fieldErrors.zip && <div id="err-zip" className="text-sm text-red-600 mt-1">{fieldErrors.zip}</div>}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Status</label>
                <select
                  className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition-colors disabled:opacity-60"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? (editingIndex !== null ? "Saving..." : "Adding...") : (editingIndex !== null ? "Save" : "Add Client")}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setEditingIndex(null); }} className="py-2 px-4 rounded-lg border">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showConfirm.open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30">
          <div className="bg-card rounded p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Confirm remove</h3>
            <p className="mb-4">Are you sure you want to remove this client? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={cancelRemove} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={confirmRemove} className="px-4 py-2 bg-red-600 text-white rounded">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
