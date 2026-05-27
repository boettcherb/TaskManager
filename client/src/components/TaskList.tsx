import { useState } from "react";
import Task from "./Task";
import { mockTasks } from "../data/mockTasks";
import type { Task as TaskType } from "../types/Task";

function TaskList() {
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
        <section className="task-list-section">
            <div className="task-list-header">
                <h1>Task List</h1>
                <p>{mockTasks.length} tasks</p>
            </div>
            <div className="task-list">
                {tasks.map((task) => (
                    <Task
                        key={task.id}
                        task={task}
                        onToggleStatus={toggleTaskStatus}
                        onUpdateProgress={updateTaskProgress}
                    />
                ))}
            </div>
        </section>
    );
}

export default TaskList;
