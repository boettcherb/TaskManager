import { useState } from "react";
import "./LoginForm.css";

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
  onSignup: (username: string, password: string) => void;
}

function LoginForm({ onLogin, onSignup }: LoginFormProps) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [login, setLogin] = useState<boolean>(true);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (login) {
      onLogin(username, password);
    } else {
      onSignup(username, password);
    }
  }

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>{login ? "Log In" : "Sign Up"}</h1>

        <label className="login-field">
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>

        <label className="login-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <button className="login-button" type="submit">
          {login ? "Log In" : "Create Account"}
        </button>
        <button className="login-button" onClick={() => setLogin((current) => !current)}>
          {login ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
        </button>
      </form>
    </main>
  );
}

export default LoginForm;
