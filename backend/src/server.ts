import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./db/pool.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Routes:
// GET / - Basic API info
// GET /health - Health check endpoint
// GET /debug/db - Debug endpoint to check database connection

app.get("/", (req, res) => {
    res.send("Smart Task Manager API");
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Backend is running",
    });
});

app.get("/debug/db", async (req, res) => {
  const result = await pool.query("SELECT NOW() AS current_time");
  res.json(result.rows[0]);
});

// Auth routes
// POST /auth/login - Authenticate user and return JWT token
// POST /auth/signup - Create a new user account and return JWT token
// PATCH /auth/change-password - Change the logged-in user's password
// DELETE /auth/delete-account - Delete the logged-in user's account and all their tasks

app.use("/auth", authRoutes);

// Task routes
// GET /tasks - Get all tasks
// POST /tasks - Create a new task
// PATCH /tasks/:id/status - Update the status of a checkbox task
// PATCH /tasks/:id/progress - Update the progress of a progress task
// PATCH /tasks/:id - Update task details (title, due date, priority)
// DELETE /tasks/:id - Delete a task

app.use("/tasks", taskRoutes);
