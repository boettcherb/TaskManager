import { useState } from "react";
import "./Header.css";

interface HeaderProps {
  username: string;
  onLogout: () => void;
  onChangePassword: (oldPassword: string, newPassword: string) => void;
  onDeleteAccount: () => void;
}

function Header({ username, onLogout, onChangePassword, onDeleteAccount }: HeaderProps) {
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");

  function closePasswordModal() {
    setPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
  }

  function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    onChangePassword(currentPassword, newPassword);
    closePasswordModal();
  }

  return (
    <header className="header">
      <h1 className="header-title">Task App</h1>
      <div className="header-user">
        <span>{username}</span>
        <button type="button" onClick={onLogout}>
          Logout
        </button>
        <button type="button" onClick={() => setPasswordModalOpen(true)}>
          Change Password
        </button>
        <button type="button" onClick={onDeleteAccount}>
          Delete Account
        </button>
      </div>
      {passwordModalOpen && (
        <div className="modal-backdrop">
          <div className="password-modal">
            <h2>Change Password</h2>
            <form className="password-modal-form" onSubmit={handlePasswordSubmit}>
              <label className="password-modal-field">
                <span>Current Password</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
              </label>
              <label className="password-modal-field">
                <span>New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
              </label>
              <div className="password-modal-actions">
                <button type="button" onClick={closePasswordModal}>
                  Cancel
                </button>
                <button type="submit">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
