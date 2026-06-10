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
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");

  function closePasswordModal() {
    setPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
  }

  function closeDeleteModal() {
    setDeleteModalOpen(false);
    setCurrentPassword("");
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
        <button type="button" onClick={() => setDeleteModalOpen(true)}>
          Delete Account
        </button>
      </div>
      {passwordModalOpen && (
        <div className="modal-backdrop">
          <div className="header-modal">
            <h2>Change Password</h2>
            <form className="header-modal-form" onSubmit={handlePasswordSubmit}>
              <label className="header-modal-field">
                <span>Current Password</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
              </label>
              <label className="header-modal-field">
                <span>New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
              </label>
              <div className="header-modal-actions">
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
      {deleteModalOpen && (
        <div className="modal-backdrop">
          <div className="header-modal">
            <h2>Confirm Account Deletion</h2>
            <label className="header-modal-field">
              <span>Enter Current Password:</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </label>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="header-modal-actions">
              <button type="button" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button type="submit" onClick={onDeleteAccount}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
