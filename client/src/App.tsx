import { useState } from "react";
import Header from './components/Header';
import TaskList from './components/TaskList.tsx';
import TaskForm from './components/TaskForm';
import './App.css';
import type { Task as TaskType } from "./types/Task";
import { mockTasks } from "./data/mockTasks.ts";

function App() {
    const [tasks, setTasks] = useState<TaskType[]>(mockTasks);

    function toggleTaskStatus(taskId: string) {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === taskId
                    ? { ...task, status: task.status === "todo" ? "completed" : "todo" }
                    : task
            )
        );
    }

    function updateTaskProgress(taskId: string, amount: number) {
        setTasks((prevTasks) =>
            prevTasks.map((task) => {
                if (task.id !== taskId || task.type !== "progress" || !task.progress) {
                    return task;
                }
                const newProgress = Math.max(0, task.progress.current + amount);
                const newStatus = newProgress >= task.progress.target ? "completed" : "todo";
                return { ...task, status: newStatus, progress: { ...task.progress, current: newProgress } };
            })
        );
    }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <section className="left-panel">
          <TaskList
            tasks={tasks}
            onToggleStatus={toggleTaskStatus}
            onUpdateProgress={updateTaskProgress}
          />
        </section>
        <section className="right-panel">
          <TaskForm onAddTask={(newTask) => setTasks((prev) => [newTask, ...prev])} />
        </section>
      </main>
    </div>
  );
}

export default App;
