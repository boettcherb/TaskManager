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
// Called when user toggles the checkbox for a checkbox task
router.patch("/:id/status", (req, res) => {
    // Retrieve id from URL path and status from request body
    const { id } = req.params;
    const { status } = req.body;
    // Validate that status is either "todo" or "completed"
    if (status !== "todo" && status !== "completed") {
        res.status(400).json({ error: "Invalid status value" });
        return;
    }
    // Find the task with the given ID. If not found, return 404 error
    const task = tasks.find((t) => t.id === id);
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
// Called when user updates the progress for a progress task
router.patch("/:id/progress", (req, res) => {
    // Retrieve id from URL path and progress amount from request body
    const { id } = req.params;
    const { progress } = req.body;
    // Validate that progress is a number
    if (typeof progress !== "number") {
        res.status(400).json({ error: "Progress amount must be a number" });
        return;
    }
    // Find the task with the given ID. If not found, return 404 error
    const task = tasks.find((t) => t.id === id);
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


// PATCH /tasks/:id - Update task details (title, priority, due date)
router.patch("/:id", (req, res) => {
    // Retrieve id from URL path and updated fields from request body
    const { id } = req.params;
    const { title, priority, dueDate } = req.body;
    // Find the task with the given ID. If not found, return 404 error
    const task = tasks.find((t) => t.id === id);
    if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
    }
    // Validate and update fields if they are provided in the request body.
    // If a field is not provided, it will not be updated
    if (title !== undefined) {
        // Validate that title is a non-empty string
        if (typeof title !== "string" || title.trim() === "") {
            res.status(400).json({ error: "Title must be a non-empty string" });
            return;
        }
        task.title = title.trim();
    }
    if (priority !== undefined) {
        // Validate that priority is one of the allowed values (low, medium, high)
        if (!["low", "medium", "high"].includes(priority)) {
            res.status(400).json({ error: "Invalid priority value" });
            return;
        }
        task.priority = priority;
    }
    if (dueDate !== undefined) {
        // Allow dueDate to be set to null to clear the due date. Otherwise,
        // validate that it's a valid date string.
        if (dueDate === null) {
            task.dueDate = undefined;
        } else {
            const parsedDate = new Date(dueDate);
            if (isNaN(parsedDate.getTime())) {
                res.status(400).json({ error: "Invalid due date value" });
                return;
            }
            task.dueDate = parsedDate.toISOString();
        }
    }
    res.json(task);
});


// DELETE /tasks/:id - Delete a task
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const originalLength = tasks.length;
    tasks = tasks.filter((t) => t.id !== id);
    if (tasks.length === originalLength) {
        res.status(404).json({ error: "Task not found" });
        return;
    }
    res.status(204).send(); // 204 No Content: indicates successful deletion with no response body
});

export default router;
