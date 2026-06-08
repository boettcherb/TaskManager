import TaskCard from "./TaskCard";
import type { Task, TaskStatus, EditTaskInput } from "../types/Task";
import "./TaskList.css";

interface TaskListProps {
  tasks: Task[];
  onToggleStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateProgress: (taskId: string, amount: number) => void;
  onEditTask: (taskId: string, editedTask: EditTaskInput) => void;
}

function TaskList({ tasks, onToggleStatus, onUpdateProgress, onEditTask }: TaskListProps) {
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
            onEditTask={onEditTask}
          />
        ))}
      </div>
    </section>
  );
}

export default TaskList;
