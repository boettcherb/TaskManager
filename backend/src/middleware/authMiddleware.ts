import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// JWT payload for every request contains the user's ID and username
interface AuthTokenPayload {
    userId: string;
    username: string;
}

// Extend Express's Request type to include an optional 'user' property that
// will hold the authenticated user's info after the token is verified
export interface AuthenticatedRequest extends Request {
    user?: AuthTokenPayload;
}


// Middleware that runs before the final route handler.
// 1. Read the Authorization header.
// 2. Extract the JWT token.
// 3. Verify that the token is valid.
// 4. Put the logged-in user's info on req.user.
// 5. Call next() so the request can continue.
export function requireAuth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    // 1. Read the Authorization header. Ensure the request includes the
    // header. If not, return a 401 Unauthorized error.
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: "Authorization header is required" });
        return;
    }
    // 2. Extract the JWT token. The header should be in the format
    // "Bearer <token>". If the scheme is not "Bearer" or the token is
    // missing, return a 401 error.
    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
        res.status(401).json({ error: "Invalid authorization header" });
        return;
    }
    // Load the JWT secret from environment variables. This is needed to verify
    // the token's signature and expiration. If the secret is not configured,
    // that is a backend config issue, so return 500 Internal Server Error.
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        res.status(500).json({ error: "JWT secret is not configured" });
        return;
    }

    try {
        // 3. Verify the token using jwt.verify. If the token is invalid or expired,
        // return a 401 error. If valid, jwt.verify returns the decoded payload with
        // the user's ID and username that were signed when the token was created.
        const payload = jwt.verify(token, jwtSecret) as AuthTokenPayload;
        // 4. Put the logged-in user's info on req.user. This lets us know
        // which user is making the request.
        req.user = {
            userId: payload.userId,
            username: payload.username,
        };
        // 5. Call next() so the request can continue to the next middleware
        // or to the final route handler.
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}
