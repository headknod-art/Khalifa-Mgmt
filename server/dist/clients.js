import express from "express";
import { randomUUID } from "crypto";
// In-memory store for now; replace with DB later
const clients = [];
const router = express.Router();
// Get all clients
router.get("/", (_req, res) => {
    res.json(clients);
});
// Add a client
router.post("/", (req, res) => {
    const client = { id: randomUUID(), ...req.body };
    clients.push(client);
    res.status(201).json(client);
});
// Remove a client
router.delete("/:id", (req, res) => {
    const idx = clients.findIndex((c) => c.id === req.params.id);
    if (idx === -1)
        return res.status(404).json({ error: "Not found" });
    clients.splice(idx, 1);
    res.status(204).end();
});
// Edit a client
router.put("/:id", (req, res) => {
    const idx = clients.findIndex((c) => c.id === req.params.id);
    if (idx === -1)
        return res.status(404).json({ error: "Not found" });
    clients[idx] = { ...clients[idx], ...req.body };
    res.json(clients[idx]);
});
export default router;
