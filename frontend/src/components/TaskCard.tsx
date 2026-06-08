import { useState } from "react";
import type { Task, TaskStatus } from "../types/Task";
import "./TaskCard.css";

interface TaskCardProps {
  task: Task;
  onToggleStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateProgress: (taskId: string, amount: number) => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TaskCard({ task, onToggleStatus, onUpdateProgress }: TaskCardProps) {
  const progressPercent =
    task.type === "progress" && task.progress
      ? Math.min((task.progress.current / task.progress.target) * 100, 100)
      : 0;

  const isCompleted = task.status === "completed";

  const [progressInput, setProgressInput] = useState<number>(1);

  return (
    <article className={`task ${isCompleted ? "task-completed" : ""}`}>
      <div className="task-header">
        <div>
          <h2 className="task-title">{task.title}</h2>
          <p className="task-created">
            Created {formatDate(task.createdAt)}
          </p>
        </div>

        <span className={`priority-tag priority-${task.priority}`}>
          {task.priority}
        </span>
      </div>

      <div className="task-meta">
        <span>{task.type}</span>
        <span>{task.status}</span>
        {task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}
      </div>

      {task.type === "progress" && task.progress && (
        <div className="progress-section">
          <div className="progress-label">
            <span>Progress</span>
            <span>
              {task.progress.current}/{task.progress.target}{" "}
              {task.progress.unit}
            </span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="progress-controls">
            <input
              className="progress-input"
              type="number"
              min="1"
              value={progressInput}
              onChange={(event) => setProgressInput(Number(event.target.value))}
            />

            <button
              className="progress-button"
              type="button"
              onClick={() => onUpdateProgress(task.id, progressInput)}
            >
              +
            </button>

            <button
              className="progress-button"
              type="button"
              onClick={() => onUpdateProgress(task.id, -progressInput)}
            >
              -
            </button>
          </div>
                  
          {isCompleted && (
            <span className="completion-badge completion-completed">
              ✔ Completed
            </span>
          )}
        </div>
      )}

      {task.type === "checkbox" && (
        <div className="checkbox-section">
          <span
            className={`completion-badge ${
              isCompleted ? "completion-completed" : "completion-pending"
            }`}
          >
            {isCompleted ? "✔ Completed" : "✖ Not Completed"}
          </span>

          <label className="checkbox">
            Mark {isCompleted ? "Not Completed" : "Completed"}:
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={() => onToggleStatus(task.id, isCompleted ? "todo" : "completed")}
            />
          </label>
        </div>
      )}
    </article>
  );
}

export default TaskCard;
