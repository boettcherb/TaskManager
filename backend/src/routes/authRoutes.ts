import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { requireAuth, type AuthenticatedRequest } from "../middleware/authMiddleware.js";
import * as userDb from "../db/userRepository.js";

const router = express.Router();


// Helper function to create a JWT token for a user. Returns the token
// as a string or null if the JWT secret is not configured
function createAuthToken(user: { id: string; username: string }): string | null {
    // Retrieve JWT secret from '.env'. If not configured, return null (error)
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return null;
    }
    // Generate a JWT token by signing the user's ID and username with the
    // secret. Set token to expire in 1 hour
    return jwt.sign(
        {
            userId: user.id,
            username: user.username,
        },
        jwtSecret,
        {
            expiresIn: "1h",
        }
    );
}


// POST /login - Authenticate user and return JWT token
// Called when user submits the login form
router.post("/login", async (req, res) => {
    try {
        // Retrieve username and password from request body
        const { username, password } = req.body;
        // Validate that username and password are provided and are strings
        if (typeof username !== "string" || typeof password !== "string") {
            res.status(400).json({ error: "Username and password are required" });
            return;
        }
        // Find user by username (case-insensitive). If not found, return 401 error
        const normalizedUsername = username.trim().toLowerCase();
        const user = await userDb.getUserByUsername(normalizedUsername);
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
        // Create a JWT token, and return the token and user info in the response body
        const token = createAuthToken(user);
        if (!token) {
            res.status(500).json({ error: "JWT secret is not configured" });
            return;
        }
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to log in" });
    }
});


// POST /signup - Register a new user and return JWT token
// Called when user submits the signup form
router.post("/signup", async (req, res) => {
    try {
        // Retrieve username and password from request body
        const { username, password } = req.body;
        // Validate that username and password are provided and are strings and
        // meet length and char requirements. If validation fails, return 400 error
        if (typeof username !== "string" || typeof password !== "string") {
            res.status(400).json({ error: "Username and password are required" });
            return;
        }
        const normalizedUsername = username.trim().toLowerCase();
        if (normalizedUsername.length < 3 || normalizedUsername.length > 15) {
            res.status(400).json({ error: "Username must be between 3 and 15 characters" });
            return;
        }
        if (!/^[a-z0-9_-]+$/.test(normalizedUsername)) {
            res.status(400).json({
                error: "Username can only contain letters, numbers, underscores, and hyphens"
            });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ error: "Password must be at least 6 characters" });
            return;
        }
        // Check if a user with the same username already exists (case-insensitive).
        // If user already exists, return 409 error
        const existingUser = await userDb.getUserByUsername(normalizedUsername);
        if (existingUser) {
            res.status(409).json({ error: "Username already exists" });
            return;
        }
        // Create a new user in the database with the provided username and hashed password
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await userDb.createUser(normalizedUsername, passwordHash);
        // Create a JWT token, and return the token and user info in the response body
        const token = createAuthToken(newUser);
        if (!token) {
            res.status(500).json({ error: "JWT secret is not configured" });
            return;
        }
        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                createdAt: newUser.createdAt,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to sign up" });
    }
});


// Every route below this middleware requires the user to already be
// authenticated with a valid JWT token
router.use(requireAuth);


// PATCH /auth/change-password - Change the logged-in user's password
// Called when user submits the change password form in the header
router.patch("/change-password", async (req: AuthenticatedRequest, res) => {
    try {
        // Retrieve old password and new password from request body
        const { oldPassword, newPassword } = req.body;
        // Password validation: they must be strings, new password must be more than
        // 6 characters, and they must be different. If validation fails, return 400 error
        if (typeof oldPassword !== "string" || typeof newPassword !== "string") {
            res.status(400).json({ error: "Passwords are required" });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({ error: "Password must be at least 6 characters" });
            return;
        }
        if (oldPassword === newPassword) {
            res.status(400).json({
                error: "New password must be different from old password"
            });
            return;
        }
        // Find the user by their ID. If user not found, return 404 error
        const user = await userDb.getUserById(req.user!.userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Validate that oldPassword matches the user's actual password
        const oldPassIsValid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!oldPassIsValid) {
            res.status(401).json({ error: "Old password is incorrect" });
            return;
        }
        // Hash the new password and update the user's passwordHash
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        const updated = await userDb.updateUserPassword(user.id, newPasswordHash);
        if (!updated) {
            res.status(500).json({ error: "Failed to update password" });
            return;
        }
        res.json({ message: "Password changed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to change password" });
    }
});


// DELETE /auth/delete-account - Delete the logged-in user's account
// Called when user clicks "Delete Account" button in the header and confirms
router.delete("/delete-account", async (req: AuthenticatedRequest, res) => {
    try {
        // Retrieve current password from request body
        const { currentPassword } = req.body;
        // Ensure the password is provided and is a string. If not, return 400 error
        if (typeof currentPassword !== "string") {
            res.status(400).json({ error: "Password is required" });
            return;
        }
        // Find the user by their ID. If user not found, return 404 error
        const user = await userDb.getUserById(req.user!.userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Validate that the provided password matches the user's actual password. If
        // password is incorrect, return 401 error
        const passwordIsValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!passwordIsValid) {
            res.status(401).json({ error: "Password is incorrect" });
            return;
        }
        // Remove the user and all associated tasks from the data store. If
        // deletion fails, return 500 error
        const deleted = await userDb.deleteUserById(user.id);
        if (!deleted) {
            res.status(500).json({ error: "Failed to delete user" });
            return;
        }
        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete account" });
    }
});

export default router;
