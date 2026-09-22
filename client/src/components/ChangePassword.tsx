import { FormEvent, useState } from "react";
import { changePassword } from "../api";

interface ChangePasswordProps {
  onPasswordChanged: () => void;
}

export default function ChangePassword({
  onPasswordChanged,
}: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const validationErrors: string[] = [];

    if (!currentPassword.trim()) {
      validationErrors.push("Current password is required");
    }

    if (!newPassword) {
      validationErrors.push("New password is required");
    } else if (newPassword.length < 8) {
      validationErrors.push("New password must be at least 8 characters");
    }

    if (!confirmPassword) {
      validationErrors.push("Confirm new password is required");
    } else if (newPassword !== confirmPassword) {
      validationErrors.push("Passwords do not match");
    }

    return validationErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors([]);
    setApiError("");

    const validationErrors = validate();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      onPasswordChanged();
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Unable to change password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="h3 mb-3">Change Password</h1>

              <p className="text-muted mb-4">
                Please change your password before continuing.
              </p>

              {apiError && (
                <div className="alert alert-danger" role="alert">
                  {apiError}
                </div>
              )}

              {errors.length > 0 && (
                <div className="alert alert-danger" role="alert">
                  <ul className="mb-0">
                    {errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label
                    htmlFor="current-password"
                    className="form-label"
                  >
                    Current Password
                  </label>

                  <input
                    id="current-password"
                    type="password"
                    className="form-control"
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(event.target.value)
                    }
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="new-password"
                    className="form-label"
                  >
                    New Password
                  </label>

                  <input
                    id="new-password"
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    disabled={loading}
                    autoComplete="new-password"
                  />

                  <div className="form-text">
                    Password must be at least 8 characters.
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="confirm-new-password"
                    className="form-label"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="confirm-new-password"
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
