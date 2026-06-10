import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

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

app.get("/", (req, res) => {
    res.send("Smart Task Manager API");
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Backend is running",
    });
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
