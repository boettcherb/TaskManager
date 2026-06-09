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
    const normalizedUsername = username.trim().toLowerCase();
    const user = users.find(
        (user) => user.username.toLowerCase() === normalizedUsername
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


// POST /signup - Register a new user and return JWT token
// Called when user submits the signup form
router.post("/signup", async (req, res) => {
    // Retrieve username and password from request body
    const { username, password } = req.body;
    // Validate that username and password are provided and are strings and
    // meet minimum length requirements. If validation fails, return 400 error
    if (typeof username !== "string" || typeof password !== "string") {
        res.status(400).json({ error: "Username and password are required" });
        return;
    }
    const normalizedUsername = username.trim().toLowerCase();
    if (normalizedUsername.length < 3) {
        res.status(400).json({ error: "Username must be at least 3 characters" });
        return;
    }
    if (password.length < 8) {
        res.status(400).json({ error: "Password must be at least 8 characters" });
        return;
    }
    // Check if a user with the same username already exists (case-insensitive).
    // If user already exists, return 409 error
    const existingUser = users.find(
        (user) => user.username.toLowerCase() === normalizedUsername
    );
    if (existingUser) {
        res.status(409).json({ error: "Username already exists" });
        return;
    }
    // Retrieve JWT secret from '.env'. If not configured, return 500 error
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        res.status(500).json({ error: "JWT secret is not configured" });
        return;
    }
    // Create a new user with a unique ID, hashed password, and current
    // timestamp, and add it to the list of users.
    const newUser: User = {
        id: crypto.randomUUID(),
        username: normalizedUsername,
        passwordHash: await bcrypt.hash(password, 10),
        createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    // Generate a JWT token by signing the user's ID and username with the
    // secret. Set token to expire in 1 hour
    const token = jwt.sign(
        {
            userId: newUser.id,
            username: newUser.username,
        },
        jwtSecret,
        {
            expiresIn: "1h",
        }
    );
    // Return the JWT token and user info in the response body
    // 201 status: Successfully created new user
    res.status(201).json({
        token,
        user: {
            id: newUser.id,
            username: newUser.username,
            createdAt: newUser.createdAt,
        },
    });
});

export default router;
