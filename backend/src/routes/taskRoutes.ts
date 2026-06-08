import express from "express";
import type { Task } from "../types/Task.js";
import { mockTasks } from "../data/mockTasks.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(requireAuth); // Apply authentication middleware to all task routes

// Hardcoded in-memory array of tasks to simulate a database for now
let tasks: Task[] = [...mockTasks];


// GET /tasks - Get all tasks for the current user
// Called when TaskList component mounts to load existing tasks
router.get("/", (req: AuthenticatedRequest, res) => {
    const userTasks = tasks.filter((task) => task.userId === req.user?.userId);
    res.json(userTasks);
});


// POST /tasks - Create a new task
// Called when user fills out the new task form and submits it
router.post("/", (req: AuthenticatedRequest, res) => {
    // Ensure the user is authenticated and we have their user ID from the JWT
    if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    // TODO: Validate task data (title, type, priority, etc.)
    // Create new task with generated ID and current timestamp
    const newTask: Task = {
        ...(req.body as Task),
        id: crypto.randomUUID(),
        userId: req.user.userId,
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
router.patch("/:id/status", (req: AuthenticatedRequest, res) => {
    // Retrieve task ID, task status, and user ID from the request
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.userId;
    // Validate that status is either "todo" or "completed"
    if (status !== "todo" && status !== "completed") {
        res.status(400).json({ error: "Invalid status value" });
        return;
    }
    // Find the task with the given ID. If not found, return 404 error
    const task = tasks.find((t) => t.id === id && t.userId === userId);
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
router.patch("/:id/progress", (req: AuthenticatedRequest, res) => {
    // Retrieve task ID, task progress, and user ID from the request
    const { id } = req.params;
    const { progress } = req.body;
    const userId = req.user?.userId;
    // Validate that progress is a number
    if (typeof progress !== "number") {
        res.status(400).json({ error: "Progress amount must be a number" });
        return;
    }
    // Find the task with the given ID. If not found, return 404 error
    const task = tasks.find((t) => t.id === id && t.userId === userId);
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
router.patch("/:id", (req: AuthenticatedRequest, res) => {
    // Retrieve task ID, task details, and user ID from the request
    const { id } = req.params;
    const { title, priority, dueDate } = req.body;
    const userId = req.user?.userId;
    // Find the task with the given ID. If not found, return 404 error
    const task = tasks.find((t) => t.id === id && t.userId === userId);
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
router.delete("/:id", (req: AuthenticatedRequest, res) => {
    // Retrieve task ID and user ID from the request
    const { id } = req.params;
    const userId = req.user?.userId;
    // Remove the task with the given ID from the array. If no task was
    // removed, return 404 error (task not found or does not belong to user)
    const originalLength = tasks.length;
    tasks = tasks.filter((t) => !(t.id === id && t.userId === userId));
    if (tasks.length === originalLength) {
        res.status(404).json({ error: "Task not found" });
        return;
    }
    res.status(204).send(); // 204 No Content: indicates successful deletion with no response body
});

export default router;
