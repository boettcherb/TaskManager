import TaskCard from "./TaskCard";
import type { Task, TaskStatus } from "../types/Task";
// import "./TaskList.css";

interface TaskListProps {
  tasks: Task[];
  onToggleStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateProgress: (taskId: string, amount: number) => void;
}

function TaskList({ tasks, onToggleStatus, onUpdateProgress }: TaskListProps) {
  return (
    <section className="task-list-section">
      <div className="task-list-header">
        <h1>Task List</h1>
        <p>{tasks.length} tasks</p>
      </div>
      <div className="task-list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleStatus={onToggleStatus}
            onUpdateProgress={onUpdateProgress}
          />
        ))}
      </div>
    </section>
  );
}

export default TaskList;
