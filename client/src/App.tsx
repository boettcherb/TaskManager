import Header from './components/Header';
import TaskList from './components/TaskList.tsx';
import TaskForm from './components/TaskForm';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <section className="left-panel">
          <TaskList />
        </section>
        <section className="right-panel">
          <TaskForm />
        </section>
      </main>
    </div>
  );
}

export default App;
