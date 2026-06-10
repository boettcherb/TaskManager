import type { Task } from "../types/Task.js";
import type { User } from "../types/User.js";
import { mockTasks } from "./mockTasks.js";
import { mockUsers } from "./mockUsers.js";

// In-memory data store to simulate a database for now
export const tasks: Task[] = [...mockTasks];
export const users: User[] = [...mockUsers];

// Function to delete a user and all their associated tasks. Called when the
// user deletes their account. Returns true if user was successfully deleted
export function deleteUser(userId: string): boolean {
    // Remove user from users array
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
        return false;
    }
    users.splice(userIndex, 1);
    // Remove all tasks associated with the user
    for (let i = tasks.length - 1; i >= 0; i--) {
        if (tasks[i].userId === userId) {
            tasks.splice(i, 1);
        }
    }
    return true;
}
