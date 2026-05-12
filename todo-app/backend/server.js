const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");
require("dotenv").config();

const app = express();
const todos = [];

const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));


const Task = require("./models/Task");
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

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ status: "ok", message: "Backend is running" });
});

app.get("/api/todos", (req, res) => {
    res.json(todos);
});

app.post("/api/todos", (req, res) => {
    const text = (req.body?.text ?? "").trim();

    if (!text) {
        return res.status(400).json({ message: "Todo text is required" });
    }

    const todo = {
        id: randomUUID(),
        text,
        completed: false,
        createdAt: new Date().toISOString(),
    };

    todos.unshift(todo);
    res.status(201).json(todo);
});

app.patch("/api/todos/:id", (req, res) => {
    const todo = todos.find((item) => item.id === req.params.id);

    if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
    }

    todo.completed = !todo.completed;
    res.json(todo);
});

app.delete("/api/todos/:id", (req, res) => {
    const index = todos.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: "Todo not found" });
    }

    const [removed] = todos.splice(index, 1);
    res.json(removed);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});