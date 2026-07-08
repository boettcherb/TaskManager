import express from "express";
import type { Task, CreatedTask } from "../types/Task.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import * as taskDb from "../db/taskRepository.js";

const router = express.Router();
router.use(requireAuth); // Apply authentication middleware to all task routes


// GET /tasks - Get all tasks for the current user
// Called when TaskList component mounts to load existing tasks
router.get("/", async (req: AuthenticatedRequest, res) => {
    try {
        // Fetch tasks from the database for the authenticated user
        const tasks = await taskDb.getTasksByUserId(req.user!.userId);
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to load tasks" });
    }
});


// POST /tasks - Create a new task
// Called when user fills out the new task form and submits it
router.post("/", async (req: AuthenticatedRequest, res) => {
    try {
        // TODO: Validate task data (title, type, priority, etc.)
        // Create the new task in the database for the authenticated user
        const taskData: CreatedTask = req.body;
        const newTask = await taskDb.createTask(req.user!.userId, taskData);
        // 201 status: Successfully created new task
        // Return the newly created task so the frontend can
        // update its state with the new task's data
        res.status(201).json(newTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create task" });
    }
});


// PATCH /tasks/:id/status - Update the status of a checkbox task
// Called when user toggles the checkbox for a checkbox task
router.patch("/:id/status", async (req: AuthenticatedRequest, res) => {
    try {
        // Retrieve task ID, task status, and user ID from the request
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user!.userId;
        // Validate that task ID is provided and is a string (not string[])
        if (typeof id !== "string") {
            res.status(400).json({ error: "Task ID is required" });
            return;
        }
        // Validate that status is either "todo" or "completed"
        if (status !== "todo" && status !== "completed") {
            res.status(400).json({ error: "Invalid status value" });
            return;
        }
        // Find the task with the given ID. If not found, return 404 error
        const task = await taskDb.getTaskById(id, userId);
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
        const updatedTask = await taskDb.updateTask(id, userId, { status });
        if (!updatedTask) {
            res.status(500).json({ error: "Failed to update task status" });
            return;
        }
        res.json(updatedTask); // Default status is 200 for successful updates
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update task status" });
    }
});


// PATCH /tasks/:id/progress - Update the progress of a progress task
// Called when user updates the progress for a progress task
router.patch("/:id/progress", async (req: AuthenticatedRequest, res) => {
    try {
        // Retrieve task ID, task progress, and user ID from the request
        const { id } = req.params;
        const { progress } = req.body;
        const userId = req.user!.userId;
        // Validate that task ID is provided and is a string (not string[])
        if (typeof id !== "string") {
            res.status(400).json({ error: "Task ID is required" });
            return;
        }
        // Validate that progress is a number
        if (typeof progress !== "number") {
            res.status(400).json({ error: "Progress amount must be a number" });
            return;
        }
        // Find the task with the given ID. If not found, return 404 error
        const task = await taskDb.getTaskById(id, userId);
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
        const newStatus = newProgress >= task.progress.target ? "completed" : "todo";
        const updatedTask = await taskDb.updateTask(id, userId, {
            progress: { ...task.progress, current: newProgress },
            status: newStatus,
        });
        if (!updatedTask) {
            res.status(500).json({ error: "Failed to update task progress" });
            return;
        }
        res.json(updatedTask); // Default status is 200 for successful updates
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update task progress" });
    }
});


// PATCH /tasks/:id - Update task details (title, priority, due date)
router.patch("/:id", async (req: AuthenticatedRequest, res) => {
    try {
        // Retrieve task ID, task details, and user ID from the request
        const { id } = req.params;
        const { title, priority, dueDate } = req.body;
        const userId = req.user!.userId;
        // Validate that task ID is provided and is a string (not string[])
        if (typeof id !== "string") {
            res.status(400).json({ error: "Task ID is required" });
            return;
        }
        // Validate and update fields if they are provided in the request body.
        // If a field is not provided, it will not be updated
        let updates: taskDb.TaskUpdate = {};
        if (title !== undefined) {
            // Validate that title is a non-empty string
            if (typeof title !== "string" || title.trim() === "") {
                res.status(400).json({ error: "Title must be a non-empty string" });
                return;
            }
            updates.title = title.trim();
        }
        if (priority !== undefined) {
            // Validate that priority is one of the allowed values (low, medium, high)
            if (!["low", "medium", "high"].includes(priority)) {
                res.status(400).json({ error: "Invalid priority value" });
                return;
            }
            updates.priority = priority;
        }
        if (dueDate !== undefined) {
            // Allow dueDate to be set to null to clear the due date. Otherwise,
            // validate that it's a valid date string.
            if (dueDate === null) {
                updates.dueDate = undefined;
            } else {
                const parsedDate = new Date(dueDate);
                if (isNaN(parsedDate.getTime())) {
                    res.status(400).json({ error: "Invalid due date value" });
                    return;
                }
                updates.dueDate = parsedDate.toISOString();
            }
        }
        const updatedTask = await taskDb.updateTask(id, userId, updates);
        res.json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update task" });
    }
});


// DELETE /tasks/:id - Delete a task
router.delete("/:id", async (req: AuthenticatedRequest, res) => {
    try {
        // Retrieve task ID and user ID from the request
        const { id } = req.params;
        const userId = req.user!.userId;
        // Validate that task ID is provided and is a string (not string[])
        if (typeof id !== "string") {
            res.status(400).json({ error: "Task ID is required" });
            return;
        }
        const result = await taskDb.deleteTask(id, userId);
        if (!result) {
            res.status(404).json({ error: "Task not found" });
            return;
        }
        // 204 No Content: indicates successful deletion with no response body
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete task" });
    }
});

export default router;
