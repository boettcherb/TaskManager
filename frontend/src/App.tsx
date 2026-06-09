import { useState, useEffect } from "react";
import Header from './components/Header.tsx';
import TaskList from './components/TaskList.tsx';
import TaskForm from './components/TaskForm.tsx';
import LoginForm from './components/LoginForm.tsx';
import type { Task, CreatedTask, EditTaskInput } from "./types/Task.ts";
import './App.css';

async function getErrorMessage(response: Response, defaultMessage: string) {
  try {
    const errorData = await response.json();
    return errorData.error || defaultMessage;
  } catch {
    return defaultMessage;
  }
}

interface AuthUser {
  id: string;
  username: string;
  createdAt: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch tasks from backend API when component mounts
  useEffect(() => {
    if (!token) {
      return;
    }
    async function loadTasks() {
      try {
        const response = await fetch(`${API_URL}/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(await getErrorMessage(response, "Failed to load tasks"));
        }
        const tasksFromBackend: Task[] = await response.json();
        setTasks(tasksFromBackend);
      } catch (error) {
        console.error(error);
      }
    }
    loadTasks();
  }, [token]);

  // Add new task by sending POST request to backend API
  async function addTask(newTask: CreatedTask) {
    if (!token) {
      console.error("User is not authenticated");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Failed to add task"));
      }
      const savedTask: Task = await response.json();
      setTasks((currentTasks) => [savedTask, ...currentTasks]);
    } catch (error) {
      console.error(error);
    }
  }

  // Toggle task status by sending PATCH request to backend API
  async function toggleTaskStatus(taskId: string, newStatus: string) {
    if (!token) {
      console.error("User is not authenticated");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Failed to update task status"));
      }
      const updatedTask: Task = await response.json();
      setTasks((currentTasks) =>
        currentTasks.map((t) => (t.id === taskId ? updatedTask : t))
      );
    } catch (error) {
      console.error(error);
    }
  }

  // Update task progress by sending PATCH request to backend API
  async function updateTaskProgress(taskId: string, amount: number) {
    if (!token) {
      console.error("User is not authenticated");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/progress`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ progress: amount }),
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Failed to update task progress"));
      }
      const updatedTask: Task = await response.json();
      setTasks((currentTasks) =>
        currentTasks.map((t) => (t.id === taskId ? updatedTask : t))
      );
    } catch (error) {
      console.error(error);
    }
  }

  // Edit task by sending PATCH request to backend API with edited task details
  async function editTask(taskId: string, editedTask: EditTaskInput) {
    if (!token) {
      console.error("User is not authenticated");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedTask),
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Failed to edit task"));
      }
      const updatedTask: Task = await response.json();
      setTasks((currentTasks) =>
        currentTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    } catch (error) {
      console.error(error);
    }
  }

  // Delete task by sending DELETE request to backend API
  async function deleteTask(taskId: string) {
    if (!token) {
      console.error("User is not authenticated");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Failed to delete task"));
      }
      setTasks((currentTasks) => currentTasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error(error);
    }
  }

  // Log in user by sending POST request to backend API with username and password
  async function login(username: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Failed to log in"));
      }
      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      console.error(error);
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    setTasks([]);
  }

  async function signup(username: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Failed to sign up"));
      }
      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      console.error(error);
    }
  }

  if (!token || !user) {
    return <LoginForm onLogin={login} onSignup={signup} />;
  }

  return (
    <div className="app">
      <Header username={user?.username} onLogout={logout} />
      <main className="main-content">
        <section className="left-panel">
          <TaskList
            tasks={tasks}
            onToggleStatus={toggleTaskStatus}
            onUpdateProgress={updateTaskProgress}
            onEditTask={editTask}
            onDeleteTask={deleteTask}
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
