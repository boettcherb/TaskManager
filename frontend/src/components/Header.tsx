import "./Header.css";

interface HeaderProps {
  username: string;
  onLogout: () => void;
}

function Header({ username, onLogout }: HeaderProps) {
  return (
    <header className="header">
      <h1 className="header-title">Task App</h1>

      <div className="header-user">
        <span>{username}</span>
        <button type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
