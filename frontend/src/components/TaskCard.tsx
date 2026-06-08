import { useState } from "react";
import type { Task, TaskPriority, TaskStatus, EditTaskInput } from "../types/Task";
import "./TaskCard.css";

interface TaskCardProps {
  task: Task;
  onToggleStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateProgress: (taskId: string, amount: number) => void;
  onEditTask: (taskId: string, editedTask: EditTaskInput) => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toDateTimeLocalValue(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const localDate = new Date(date.getTime() - offsetMs);
  return localDate.toISOString().slice(0, 16);
}

function TaskCard({ task, onToggleStatus, onUpdateProgress, onEditTask }: TaskCardProps) {
  const progressPercent =
    task.type === "progress" && task.progress
      ? Math.min((task.progress.current / task.progress.target) * 100, 100)
      : 0;

  const isCompleted = task.status === "completed";

  const [progressInput, setProgressInput] = useState<number>(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDueDate, setEditedDueDate] = useState(toDateTimeLocalValue(task.dueDate));
  const [editedPriority, setEditedPriority] = useState<TaskPriority>(task.priority);

  function openEditModal() {
    setEditedTitle(task.title);
    setEditedDueDate(toDateTimeLocalValue(task.dueDate));
    setEditedPriority(task.priority);
    setIsEditModalOpen(true);
  }

  function closeEditModal() {
    setIsEditModalOpen(false);
  }

  function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onEditTask(task.id, {
      title: editedTitle,
      dueDate: editedDueDate
        ? new Date(editedDueDate).toISOString()
        : undefined,
      priority: editedPriority,
    });
    setIsEditModalOpen(false);
  }

  return (
    <article className={`task ${isCompleted ? "task-completed" : ""}`}>
      <div className="task-header">
        <div>
          <h2 className="task-title">{task.title}</h2>
          <p className="task-created">
            Created {formatDate(task.createdAt)}
          </p>
        </div>
        <div className="task-actions">
          <button className="edit-button" type="button" onClick={openEditModal}>
            ✎ Edit
          </button>
          <button className="delete-button" type="button">
            ✖ Delete
          </button>
        </div>
      </div>

      <div className="task-meta">
        {task.dueDate && 
          <span className="due-date-tag">
            Due {formatDate(task.dueDate)}
          </span>
        }
        <span className={`completion-badge completion-${isCompleted ? "completed" : "pending"}`}>
          {isCompleted ? "✔ Completed" : "✖ Not Completed"}
        </span>
        <span className={`priority-tag priority-${task.priority}`}>
          {task.priority}
        </span>
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
        </div>
      )}

      {task.type === "checkbox" && (
        <div className="checkbox-section">
          Mark {isCompleted ? "Not Completed" : "Completed"}:
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={() => onToggleStatus(task.id, isCompleted ? "todo" : "completed")}
          />
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-backdrop">
          <div className="edit-modal">
            <div className="edit-modal-header">
              <h2>Edit Task</h2>

              <button
                className="modal-close-button"
                type="button"
                onClick={closeEditModal}
              >
                ✖
              </button>
            </div>

            <form className="edit-modal-form" onSubmit={handleEditSubmit}>
              <label className="edit-modal-field">
                <span>Title</span>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(event) => setEditedTitle(event.target.value)}
                  required
                />
              </label>

              <label className="edit-modal-field">
                <span>Due Date</span>
                <input
                  type="datetime-local"
                  value={editedDueDate}
                  onChange={(event) => setEditedDueDate(event.target.value)}
                />
              </label>

              <label className="edit-modal-field">
                <span>Priority</span>
                <select
                  value={editedPriority}
                  onChange={(event) =>
                    setEditedPriority(event.target.value as TaskPriority)
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>

              <div className="edit-modal-actions">
                <button className="modal-cancel-button" type="button" onClick={closeEditModal}>
                  Cancel
                </button>

                <button className="modal-save-button" type="submit">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </article>
  );
}

export default TaskCard;
