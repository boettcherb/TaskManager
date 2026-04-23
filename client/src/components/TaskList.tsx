import Task from "./Task";
import { mockTasks } from "../data/mockTasks";

function TaskList() {
    return <div>
        <h1>Task List</h1>
        {mockTasks.map((task) => <Task key={task.id} task={task} />)}
    </div>
}

export default TaskList;
