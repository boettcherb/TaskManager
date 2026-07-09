import { pool } from "./pool.js";
import type { User } from "../types/User.js";


interface DbUserRow {
    id: string;
    username: string;
    password_hash: string;
    created_at: Date;
}


function mapDbUserRowToUser(row: DbUserRow): User {
    return {
        id: row.id,
        username: row.username,
        passwordHash: row.password_hash,
        createdAt: row.created_at.toISOString(),
    };
}


export async function getUserByUsername(username: string): Promise<User | null> {
    const query = `
        SELECT *
        FROM users
        WHERE username = $1
    `;
    const result = await pool.query(query, [username]);
    if (result.rows.length === 0) {
        return null;
    }
    return mapDbUserRowToUser(result.rows[0]);
}


export async function getUserById(userId: string): Promise<User | null> {
    const query = `
        SELECT *
        FROM users
        WHERE id = $1
    `;
    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) {
        return null;
    }
    return mapDbUserRowToUser(result.rows[0]);
}


export async function createUser(username: string, passwordHash: string): Promise<User> {
    const query = `
        INSERT INTO users (username, password_hash)
        VALUES ($1, $2)
        RETURNING *
    `;
    const result = await pool.query(query, [username, passwordHash]);
    return mapDbUserRowToUser(result.rows[0]);
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
    const query = `
        UPDATE users
        SET password_hash = $1
        WHERE id = $2
    `;
    const result = await pool.query(query, [passwordHash, userId]);
    return result.rowCount === 1;
}

export async function deleteUserById(userId: string): Promise<boolean> {
    const query = `
        DELETE FROM users
        WHERE id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rowCount === 1;
}
