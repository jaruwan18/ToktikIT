import { FormEvent, useState } from "react";
import { login } from "../api";

type LoginUser = {
  id: number;
  email: string;
  displayName: string;
  role: string;
  mustChangePassword: boolean;
  isActive: boolean;
  requesterId: number | null;
};

type LoginResponse = {
  user: LoginUser;
};

type LoginProps = {
  onLogin: (user: LoginUser) => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setEmailError("");
    setPasswordError("");
    setLoginError("");

    let hasError = false;

    if (!email.trim()) {
      setEmailError("Email is required");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setIsLoading(true);

      const result = (await login(email.trim(), password)) as LoginResponse;

      onLogin(result.user);
    } catch (error) {
      setLoginError(
        error instanceof Error
          ? error.message
          : "Invalid email or password",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-6 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h3 text-center mb-4">Login</h1>

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="login-email" className="form-label">
                    Email
                  </label>

                  <input
                    id="login-email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                  />

                  {emailError && (
                    <div className="text-danger small mt-1">
                      {emailError}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="login-password" className="form-label">
                    Password
                  </label>

                  <input
                    id="login-password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />

                  {passwordError && (
                    <div className="text-danger small mt-1">
                      {passwordError}
                    </div>
                  )}
                </div>

                {loginError && (
                  <div className="alert alert-danger" role="alert">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}