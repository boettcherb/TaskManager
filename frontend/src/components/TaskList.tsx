import TaskCard from "./TaskCard";
import type { Task } from "../types/Task";
// import "./TaskList.css";

function TaskList({
  tasks,
  onToggleStatus,
  onUpdateProgress,
}: {
  tasks: Task[];
  onToggleStatus: (taskId: string) => void;
  onUpdateProgress: (taskId: string, progress: number) => void;
}) {
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
