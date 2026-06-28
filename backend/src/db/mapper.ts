import type { Task } from "../types/Task.js";

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
