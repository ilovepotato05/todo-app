const express = require("express");
const router = express.Router();

const Todo = require("../models/Todo");

//GET all todos
router.get("/", async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });

        const formattedTodos = todos.map((todo) => ({
            id: todo.id,
            text: todo.text,
            completed: todo.completed,
        }));

        res.json(formattedTodos);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch todos",
        });
    }
});

//CREATE todo
router.post("/", async (req, res) => {
    try {
        const todo = await Todo.create({
            text: req.body.text,
            completed: false,
        });

        res.status(201).json({
            id: todo.id,
            text: todo.text,
            completed: todo.completed,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to created todo",
        });
    }
});

//TOGGLE completed
router.patch("/:id", async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({
                message: "Todo not found",
            });
        }

        todo.completed = !todo.completed;

        await todo.save();

        res.json({
            id: todo.id,
            text: todo.text,
            completed: todo.completed,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update todo",
        });
    }
});

//DELETE todo
router.delete("/:id", async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.id);

        if (!todo) {
            return res.status(404).json({
                message: "Todo not found",
            });
        }

        res.json({
            message: "Todo deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete todo",
        });
    }
});

module.exports = router;