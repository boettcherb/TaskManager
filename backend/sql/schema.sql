-- Smart Task Manager database schema
-- PostgreSQL

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('checkbox', 'progress')),
    status TEXT NOT NULL CHECK (status IN ('todo', 'completed')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ,

    progress_current INTEGER,
    progress_target INTEGER,
    progress_unit TEXT,

    CHECK (
        (
            task_type = 'checkbox'
            AND progress_current IS NULL
            AND progress_target IS NULL
            AND progress_unit IS NULL
        )
        OR
        (
            task_type = 'progress'
            AND progress_current IS NOT NULL
            AND progress_target IS NOT NULL
            AND progress_target > 0
        )
    )
);
