import { useState, useEffect } from "react";
import Header from './components/Header.tsx';
import TaskList from './components/TaskList.tsx';
import TaskForm from './components/TaskForm.tsx';
import './App.css';
import type { Task, CreatedTask } from "./types/Task.ts";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch tasks from backend API when component mounts
  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch(`${API_URL}/tasks`);
        if (!response.ok) {
          throw new Error("Failed to load tasks");
        }
        const tasksFromBackend: Task[] = await response.json();
        setTasks(tasksFromBackend);
      } catch (error) {
        console.error(error);
      }
    }
    loadTasks();
  }, []);

  // Add new task by sending POST request to backend API
  async function addTask(newTask: CreatedTask) {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) {
        throw new Error("Failed to add task");
      }
      const savedTask: Task = await response.json();
      setTasks((currentTasks) => [savedTask, ...currentTasks]);
    } catch (error) {
      console.error(error);
    }
  }

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
          <TaskForm onAddTask={addTask} />
        </section>
      </main>
    </div>
  );
}

export default App;
