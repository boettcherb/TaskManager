import { pool } from "./pool.js";
import { mapDbTaskRowToTask } from "./mapper.js";
import type { Task, CreatedTask } from "../types/Task.js";

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

export async function createTask(userId: string, task: CreatedTask): Promise<Task> {
    const query = `
        INSERT INTO tasks
        (
            user_id,
            title,
            task_type,
            status,
            priority,
            due_date,
            progress_current,
            progress_target,
            progress_unit
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `;
    const values = [
        userId,
        task.title,
        task.type,
        'todo', // New tasks always start with "todo" status
        task.priority,
        task.dueDate ?? null,
        task.type === 'progress' ? (task.progress?.current ?? 0) : null,
        task.type === 'progress' ? (task.progress?.target ?? 1) : null,
        task.type === 'progress' ? (task.progress?.unit ?? 'units') : null,
    ];
    const result = await pool.query(query, values);
    return mapDbTaskRowToTask(result.rows[0]);
}
