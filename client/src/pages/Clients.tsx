import { useState } from "react";

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

  // Placeholder for API/database integration
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: Replace with API call
    setTimeout(() => {
      setClients((prev) => [
        { id: Date.now(), ...form },
        ...prev,
      ]);
      setForm({ name: "", email: "", phone: "", address: "", city: "", state: "", zip: "", status: "Active" });
      setShowModal(false);
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-10 tracking-tight">Client Management</h1>
      <div className="bg-card border border-border rounded-3xl shadow-2xl p-12 max-w-6xl mx-auto transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Clients</h2>
          <button
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-semibold shadow hover:bg-primary/90 transition-colors"
            type="button"
            onClick={() => setShowModal(true)}
          >
            Add Client
          </button>
        </div>
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-muted-foreground text-lg mb-6">No clients found.</div>
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
                {clients.map((client, idx) => (
                  <tr key={client.id} className="border-b border-border hover:bg-primary/10 transition-colors duration-200 cursor-pointer">
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
                        onClick={() => handleEditClient(idx)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1.5 rounded bg-red-100 text-red-800 text-sm font-semibold hover:bg-red-200 focus:ring-2 focus:ring-red-400 transition-all duration-150"
                        onClick={() => handleRemoveClient(idx)}
                        type="button"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-xs relative">
            <button
              className="absolute top-3 right-3 text-xl text-muted-foreground hover:text-foreground"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6">Add Client</h2>
            <form onSubmit={handleAddClient} className="space-y-5">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Phone Number</label>
                <input
                  className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  required
                />
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
                    className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    type="text"
                    value={form.zip}
                    onChange={e => setForm(f => ({ ...f, zip: e.target.value }))}
                    required
                  />
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
              <button
                className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition-colors disabled:opacity-60"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Adding..." : "Add Client"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
