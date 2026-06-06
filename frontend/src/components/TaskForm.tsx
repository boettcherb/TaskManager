import { useState } from "react";
import type { CreatedTask, TaskPriority, TaskType } from "../types/Task";
import "./TaskForm.css";

function TaskForm({ onAddTask }: { onAddTask: (task: CreatedTask) => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("checkbox");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [progressTarget, setProgressTarget] = useState("1");
  const [progressUnit, setProgressUnit] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newTask: CreatedTask = {
      title,
      type,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      progress:
        type === "progress"
          ? {
            current: 0,
            target: Number(progressTarget),
            unit: progressUnit || undefined,
          }
          : undefined,
    };

    onAddTask(newTask);

    setTitle("");
    setType("checkbox");
    setPriority("medium");
    setDueDate("");
    setProgressTarget("1");
    setProgressUnit("");
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h1 className="task-form-title">Create Task</h1>

      <label className="form-field">
        <span>Title</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Example: Read 20 pages"
          required
        />
      </label>

      <label className="form-field">
        <span>Type</span>
        <select
          value={type}
          onChange={(event) => setType(event.target.value as TaskType)}
        >
          <option value="checkbox">Checkbox</option>
          <option value="progress">Progress</option>
        </select>
      </label>

      <label className="form-field">
        <span>Priority</span>
        <select
          value={priority}
          onChange={(event) =>
            setPriority(event.target.value as TaskPriority)
          }
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      <label className="form-field">
        <span>Due Date</span>
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          required
        />
      </label>

      {type === "progress" && (
        <div className="progress-form-section">
          <h2 className="progress-form-title">Progress Settings</h2>

          <label className="form-field">
            <span>Target</span>
            <input
              type="number"
              min="1"
              step="1"
              value={progressTarget}
              onChange={(event) =>
                setProgressTarget(event.target.value)
              }
              required
            />
          </label>

          <label className="form-field">
            <span>Unit</span>
            <input
              type="text"
              value={progressUnit}
              onChange={(event) =>
                setProgressUnit(event.target.value)
              }
              placeholder="pages, miles, reps, etc."
              required
            />
          </label>
        </div>
      )}

      <button className="task-form-submit" type="submit">
        Add Task
      </button>
    </form>
  );
}

export default TaskForm;
