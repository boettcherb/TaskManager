# Task Manager App

A full-stack task management app built with React, TypeScript, Express, PostgreSQL, and JWT authentication.

This Task Manager App allows users to create an account, log in, and manage their own personal tasks. The app supports two types of tasks: standard checkbox tasks and progress-based tasks with current/target progress tracking. User accounts, hashed passwords, and tasks are persisted in a PostgreSQL database.

* Live App: https://taskapp.brandonboettcher.dev

> Demo note: This is a portfolio project. Please do not use a real password.

## Screenshots

### Login Screen

![Login screen](./screenshots/login.png)

### Main Dashboard

![Task dashboard](./screenshots/dashboard.png)

### Edit Task Modal

![Edit task modal](./screenshots/edit-task.png)

## Features

* Create, edit, and delete tasks
* Checkbox tasks with complete/incomplete status
* Progress tasks with current/target progress tracking
* User signup and login
* JWT-based authentication
* Change password functionality
* Delete account functionality
* Password hashing with bcrypt
* PostgreSQL database persistence
* Responsive layout for narrower screens

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* CSS

### Backend

* Node.js
* Express
* TypeScript
* PostgreSQL
* `pg` / node-postgres
* bcrypt
* JSON Web Tokens

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: Neon PostgreSQL

## What I Learned

This project helped me practice building a full-stack application from scratch, including:

* Structuring a React application with reusable components
* Managing frontend state with React hooks
* Creating controlled forms in React
* Connecting a React frontend to an Express backend
* Designing REST API routes
* Implementing signup and login flows
* Hashing passwords with bcrypt
* Creating and verifying JWTs
* Protecting backend routes with authentication middleware
* Designing PostgreSQL tables and relationships
* Writing SQL queries with parameterized inputs
* Mapping database rows to TypeScript objects
* Separating database logic into repository files
* Deploying a frontend, backend, and database separately
* Configuring environment variables for local and production environments
* Handling CORS between deployed frontend and backend services

## Project Structure

```txt
TaskManager/
  frontend/
    src/
      components/
        Header.tsx
        LoginForm.tsx
        TaskCard.tsx
        TaskForm.tsx
        TaskList.tsx
      types/
        Task.ts
      App.tsx
      main.tsx
    index.html
    package.json

  backend/
    src/
      db/
        pool.ts
        taskRepository.ts
        userRepository.ts
      middleware/
        authMiddleware.ts
      routes/
        authRoutes.ts
        taskRoutes.ts
      types/
        Task.ts
        User.ts
      server.ts
    sql/
      schema.sql
    package.json
```

## Database Design

The app uses two main tables:

* `users`: stores account information and hashed passwords
* `tasks`: stores user-owned tasks with task type, status, priority, optional due date, and optional progress fields

Each task belongs to a user through a `user_id` foreign key. When a user account is deleted, that user’s tasks are deleted automatically through `ON DELETE CASCADE`.

Example schema (see the full schema in backend/sql/schema.sql):

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    task_type TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    progress_current INTEGER,
    progress_target INTEGER,
    progress_unit TEXT
);
```

## API Routes

### Auth Routes

| Method   | Route                   | Description                          |
| -------- | ----------------------- | ------------------------------------ |
| `POST`   | `/auth/signup`          | Create a new account                 |
| `POST`   | `/auth/login`           | Log in and receive a JWT             |
| `PATCH`  | `/auth/change-password` | Change the logged-in user's password |
| `DELETE` | `/auth/delete-account`  | Delete the logged-in user's account  |

### Task Routes

| Method   | Route                 | Description                          |
| -------- | --------------------- | ------------------------------------ |
| `GET`    | `/tasks`              | Get all tasks for the logged-in user |
| `POST`   | `/tasks`              | Create a new task                    |
| `PATCH`  | `/tasks/:id`          | Edit task details                    |
| `PATCH`  | `/tasks/:id/status`   | Update checkbox task status          |
| `PATCH`  | `/tasks/:id/progress` | Update progress task progress        |
| `DELETE` | `/tasks/:id`          | Delete a task                        |

## Running Locally

### Prerequisites

* Node.js
* npm
* PostgreSQL

### 1. Clone the repo

```bash
git clone https://github.com/boettcherb/TaskManager.git
cd TaskManager
```

### 2. Set up the database

Create a local PostgreSQL database named `task_app`.

Then run the schema SQL from:

```txt
backend/sql/schema.sql
```

Or manually run the table creation SQL in pgAdmin or another PostgreSQL client.

### 3. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```env
PORT=3000
JWT_SECRET=your_dev_secret
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/task_app
```

Run the backend in development mode:

```bash
npm run dev
```

The backend should be available at:

```txt
http://localhost:3000
```

You can test the health route at:

```txt
http://localhost:3000/health
```

### 4. Set up the frontend

In a separate terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend/` folder:

```env
VITE_API_URL=http://localhost:3000
```

Run the frontend:

```bash
npm run dev
```

The frontend should be available at:

```txt
http://localhost:5173
```

## Environment Variables

### Backend

| Variable       | Description                         |
| -------------- | ----------------------------------- |
| `PORT`         | Port for the Express server         |
| `JWT_SECRET`   | Secret used to sign and verify JWTs |
| `DATABASE_URL` | PostgreSQL connection string        |

### Frontend

| Variable       | Description                  |
| -------------- | ---------------------------- |
| `VITE_API_URL` | Base URL for the backend API |

## Security Notes

This project is intended as a portfolio/demo application, not a production-ready authentication system. However, it still includes basic security practices appropriate for a learning/portfolio project:

* Passwords are hashed with bcrypt before being stored
* Protected routes require a valid JWT
* SQL queries use parameterized inputs
* Users can only access tasks associated with their own user ID

## Future Improvements

Potential future improvements include:

* Task sorting
* Task filtering
* Task tags or categories
* Search functionality
* Recommended tasks to work on
* Email-based password reset
* Improved styling
* Unit and integration tests
* Refresh tokens or longer-lived sessions
* Better loading and error states
* Grouping tasks

## Reflection

I built this project to strengthen my full-stack development fundamentals. The main goal was to practice connecting a modern React frontend to a Node/Express backend, implementing authentication, working with PostgreSQL directly, and deploying a full-stack app with separate frontend, backend, and database services.

Rather than relying on an ORM, I used `pg` and wrote SQL queries directly so I could better understand how the backend communicates with the database. This helped me practice schema design, foreign keys, parameterized queries, and mapping database rows into TypeScript objects.
