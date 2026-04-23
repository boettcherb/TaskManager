import type { Task as TaskType } from "../types/Task";

interface TaskProps {
    task: TaskType;
}

function Task({ task }: TaskProps) {
    return (
        <div className="task">
            <h2>{task.title}</h2>
            <p>Type: {task.type}</p>
            <p>Status: {task.status}</p>
            <p>Priority: {task.priority}</p>
            <p>Created At: {new Date(task.createdAt).toLocaleString()}</p>
            {task.dueDate && <p>Due Date: {new Date(task.dueDate).toLocaleString()}</p>}
            {task.type === "progress" && task.progress && (
                <p>
                    Progress: {task.progress.current}/{task.progress.target} {task.progress.unit}
                </p>
            )}
        </div>
    );
}

export default Task;
