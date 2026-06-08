import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { User } from "../types/User.js";
import { mockUsers } from "../data/mockUsers.js";

const router = express.Router();

// Hardcoded in-memory array of users to simulate a database for now
let users: User[] = [...mockUsers];


// POST /login - Authenticate user and return JWT token
// Called when user submits the login form
router.post("/login", async (req, res) => {
    // Retrieve username and password from request body
    const { username, password } = req.body;
    // Validate that username and password are provided and are strings
    if (typeof username !== "string" || typeof password !== "string") {
        res.status(400).json({ error: "Username and password are required" });
        return;
    }
    // Find user by username (case-insensitive). If not found, return 401 error
    const user = users.find(
        (user) => user.username.toLowerCase() === username.toLowerCase()
    );
    if (!user) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
    }
    // Check if provided password matches the stored password hash using bcrypt.
    // If password is invalid, return 401 error
    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordIsValid) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
    }
    // Retrieve JWT secret from '.env'. If not configured, return 500 error
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        res.status(500).json({ error: "JWT secret is not configured" });
        return;
    }
    // Generate a JWT token by signing the user's ID and username with the
    // secret. Set token to expire in 1 hour
    const token = jwt.sign(
        {
            userId: user.id,
            username: user.username,
        },
        jwtSecret,
        {
            expiresIn: "1h",
        }
    );
    // Return the JWT token and user info in the response body
    res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt,
        },
    });
});

export default router;
