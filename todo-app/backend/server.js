const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

const Task = require("./models/Task");

const mapTask = (t) => ({ id: t._id.toString(), text: t.text, completed: t.completed, createdAt: t.createdAt });

app.get("/", (req, res) => {
    res.json({ status: "ok", message: "Backend is running" });
});

// Keep a plain /tasks API (raw mongoose documents)
app.get("/tasks", async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
});

app.post("/tasks", async (req, res) => {
    const task = await Task.create({
        text: req.body.text,
        completed: false
    });
    res.json(task);
});

app.delete("/tasks/:id", async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
});

// Frontend expects /api/todos with `id` field and createdAt; make these use MongoDB
app.get("/api/todos", async (req, res) => {
    const items = await Task.find().sort({ createdAt: -1 }).lean();
    res.json(items.map(mapTask));
});

app.post("/api/todos", async (req, res) => {
    const text = (req.body?.text ?? "").trim();

    if (!text) {
        return res.status(400).json({ message: "Todo text is required" });
    }

    const created = await Task.create({ text, completed: false });
    res.status(201).json(mapTask(created));
});

app.patch("/api/todos/:id", async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        return res.status(404).json({ message: "Todo not found" });
    }

    task.completed = !task.completed;
    await task.save();
    res.json(mapTask(task));
});

app.delete("/api/todos/:id", async (req, res) => {
    const removed = await Task.findByIdAndDelete(req.params.id);

    if (!removed) {
        return res.status(404).json({ message: "Todo not found" });
    }

    res.json(mapTask(removed));
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});