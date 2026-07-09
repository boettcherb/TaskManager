import { pool } from "./pool.js";
import type { Task, CreatedTask } from "../types/Task.js";


interface DbTaskRow {
    id: string;
    user_id: string;
    title: string;
    task_type: Task["type"];
    status: Task["status"];
    priority: Task["priority"];
    created_at: Date;
    due_date: Date | null;
    progress_current: number | null;
    progress_target: number | null;
    progress_unit: string | null;
}


export function mapDbTaskRowToTask(row: DbTaskRow): Task {
    return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        type: row.task_type,
        status: row.status,
        priority: row.priority,
        createdAt: row.created_at.toISOString(),
        dueDate: row.due_date ? row.due_date.toISOString() : undefined,
        progress:
            row.task_type === "progress"
                ? {
                    current: row.progress_current ?? 0,
                    target: row.progress_target ?? 1,
                    unit: row.progress_unit ?? undefined,
                }
                : undefined,
    };
}


export async function getTasksByUserId(userId: string): Promise<Task[]> {
    const query = `
        SELECT * FROM tasks
        WHERE user_id = $1
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.map(mapDbTaskRowToTask);
}


export async function getTaskById(taskId: string, userId: string): Promise<Task | null> {
    const query = `
        SELECT * FROM tasks
        WHERE id = $1 AND user_id = $2
    `;
    const result = await pool.query(query, [taskId, userId]);
    if (result.rows.length === 0) {
        return null; // Task not found
    }
    return mapDbTaskRowToTask(result.rows[0]);
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


export type TaskUpdate = {
    title?: string;
    priority?: Task["priority"];
    dueDate?: string | null;
    status?: Task["status"];
    progress?: Task["progress"];
};


export async function updateTask(
    taskId: string,
    userId: string,
    updates: TaskUpdate
): Promise<Task | null> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let index = 1;

    function addSetClause(column: string, value: unknown) {
        setClauses.push(`${column} = $${index}`);
        values.push(value);
        index++;
    }

    if (updates.title !== undefined) {
        addSetClause("title", updates.title);
    }
    if (updates.priority !== undefined) {
        addSetClause("priority", updates.priority);
    }
    if (updates.dueDate !== undefined) {
        addSetClause("due_date", updates.dueDate);
    }
    if (updates.status !== undefined) {
        addSetClause("status", updates.status);
    }
    if (updates.progress !== undefined) {
        addSetClause("progress_current", updates.progress.current);
        addSetClause("progress_target", updates.progress.target);
        addSetClause("progress_unit", updates.progress.unit ?? null);
    }
    if (setClauses.length === 0) {
        return null;
    }
    const query = `
        UPDATE tasks
        SET ${setClauses.join(", ")}
        WHERE id = $${index} AND user_id = $${index + 1}
        RETURNING *
    `;
    values.push(taskId, userId);
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
        return null;
    }
    return mapDbTaskRowToTask(result.rows[0]);
}


export async function deleteTask(taskId: string, userId: string): Promise<boolean> {
    const query = `
        DELETE FROM tasks
        WHERE id = $1 AND user_id = $2
    `;
    const result = await pool.query(query, [taskId, userId]);
    return result.rowCount == 1; // Return true if a row was deleted, false otherwise
}
