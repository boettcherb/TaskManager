import express from "express";
import type { Task } from "../types/Task.js";
import { mockTasks } from "../data/mockTasks.js";

const router = express.Router();

// Hardcoded in-memory array of tasks to simulate a database for now
let tasks: Task[] = [...mockTasks];


// GET /tasks - Get all tasks
// Called when TaskList component mounts to load existing tasks
// In the future, "get all tasks" will be replaced with "get only the user's tasks"
// For now, all tasks are returned since we don't have user accounts
router.get("/", (req, res) => {
    res.json(tasks);
});


// POST /tasks - Create a new task
// Called when user fills out the new task form and submits it
router.post("/", (req, res) => {
    // TODO: Validate task data (title, type, priority, etc.)
    // Create new task with generated ID and current timestamp
    const newTask: Task = {
        ...(req.body as Task),
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        status: "todo",
    };
    // Add new task to the beginning of the array
    tasks.unshift(newTask);
    // 201 status: Successfully created new task
    // Return the newly created task in the response body so the frontend can
    // update its state with the new task's ID, timestamp, and status
    res.status(201).json(newTask);
});


// PATCH /tasks/:id/status - Update the status of a checkbox task
// Called when user toggles the checkbox for a task
router.patch("/:id/status", (req, res) => {
    // Retrieve id from URL path and status from request body
    const { id } = req.params;
    const { status } = req.body;
    // Validate that status is either "todo" or "completed"
    if (status !== "todo" && status !== "completed") {
        res.status(400).json({ error: "Invalid status value" });
        return;
    }
    // Find the task with the given ID
    const task = tasks.find((t) => t.id === id);
    // If task not found, return 404 error
    if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
    }
    // Only allow status updates for checkbox tasks, not progress tasks
    if (task.type !== "checkbox") {
        res.status(400).json({
            error: "Only checkbox tasks can have status updated directly",
        });
        return;
    }
    // Update the task's status and return the updated task in the response
    task.status = status;
    res.json(task); // Default status is 200 for successful updates
});


// PATCH /tasks/:id/progress - Update the progress of a progress task
// Called when user updates the progress for a task
router.patch("/:id/progress", (req, res) => {
    // Retrieve id from URL path and progress amount from request body
    const { id } = req.params;
    const { progress } = req.body;
    // Validate that progress is a number
    if (typeof progress !== "number") {
        res.status(400).json({ error: "Progress amount must be a number" });
        return;
    }
    // Find the task with the given ID
    const task = tasks.find((t) => t.id === id);
    // If task not found, return 404 error
    if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
    }
    // Only allow progress updates for progress tasks, not checkbox tasks
    if (task.type !== "progress" || !task.progress) {
        res.status(400).json({
            error: "Only progress tasks can have progress updated directly",
        });
        return;
    }
    // Update the task's progress and status and return the updated task
    const newProgress = Math.max(0, task.progress.current + progress);
    task.progress.current = newProgress;
    task.status = newProgress >= task.progress.target ? "completed" : "todo";
    res.json(task); // Default status is 200 for successful updates
});


export default router;
