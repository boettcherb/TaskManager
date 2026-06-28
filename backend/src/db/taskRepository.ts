import { pool } from "./pool.js";
import { mapDbTaskRowToTask } from "./mapper.js";
import type { Task } from "../types/Task.js";

export async function getTasksByUserId(userId: string): Promise<Task[]> {
    const query = `
        SELECT * FROM tasks
        WHERE user_id = $1
        ORDER BY created_at DESC
    `;
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows.map(mapDbTaskRowToTask);
}
