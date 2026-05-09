import Task from "./Task";
import { mockTasks } from "../data/mockTasks";

function TaskList() {
    return (
        <section className="task-list-section">
            <div className="task-list-header">
                <h1>Task List</h1>
                <p>{mockTasks.length} tasks</p>
            </div>
            <div className="task-list">
                {mockTasks.map((task) => (<Task key={task.id} task={task} />))}
            </div>
        </section>
    );
}

export default TaskList;
