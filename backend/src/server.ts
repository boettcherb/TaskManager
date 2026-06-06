import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

// Task routes
// GET /tasks - Get all tasks
// POST /tasks - Create a new task

app.use("/tasks", taskRoutes);
