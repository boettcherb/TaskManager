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

export default router;
