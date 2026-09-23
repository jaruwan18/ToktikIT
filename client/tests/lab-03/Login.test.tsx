import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Login from "../../src/components/Login";
import type { CurrentUser, LoginResponse } from "../../src/api";
import * as api from "../../src/api";

vi.mock("../../src/api", () => ({
  login: vi.fn(),
}));

describe("Lab 3 - Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email, password, and login button", () => {
    render(<Login onLogin={vi.fn()} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    expect(
      screen.getByLabelText(/password/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /login/i }),
    ).toBeInTheDocument();
  });

  it("shows validation when email and password are empty", async () => {
    render(<Login onLogin={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: /login/i }),
    );

    expect(
      await screen.findByText(/email is required/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/password is required/i),
    ).toBeInTheDocument();

    expect(api.login).not.toHaveBeenCalled();
  });

  it("calls login with the entered email and password", async () => {
    const user: CurrentUser = {
      id: 1,
      email: "sarah.williams@example.com",
      displayName: "Sarah Williams",
      role: "REQUESTER",
      mustChangePassword: false,
      isActive: true,
    };

    vi.mocked(api.login).mockResolvedValue({
      user,
    });

    const onLogin = vi.fn();

    render(<Login onLogin={onLogin} />);

    fireEvent.change(
      screen.getByLabelText(/email/i),
      {
        target: {
          value: "sarah.williams@example.com",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText(/password/i),
      {
        target: {
          value: "Password123!",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", { name: /login/i }),
    );

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith(
        "sarah.williams@example.com",
        "Password123!",
      );
    });

    expect(onLogin).toHaveBeenCalledWith(user);
  });

  it("shows an authentication error when login fails", async () => {
    vi.mocked(api.login).mockRejectedValue(
      new Error("Invalid email or password"),
    );

    render(<Login onLogin={vi.fn()} />);

    fireEvent.change(
      screen.getByLabelText(/email/i),
      {
        target: {
          value: "wrong@example.com",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText(/password/i),
      {
        target: {
          value: "wrong-password",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", { name: /login/i }),
    );

    expect(
      await screen.findByText(
        /invalid email or password/i,
      ),
    ).toBeInTheDocument();
  });

  it("disables the login button while login is in progress", async () => {
    let resolveLogin!: (
      value: LoginResponse | PromiseLike<LoginResponse>,
    ) => void;

    vi.mocked(api.login).mockImplementation(
      () =>
        new Promise<LoginResponse>((resolve) => {
          resolveLogin = resolve;
        }),
    );

    render(<Login onLogin={vi.fn()} />);

    fireEvent.change(
      screen.getByLabelText(/email/i),
      {
        target: {
          value: "sarah.williams@example.com",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText(/password/i),
      {
        target: {
          value: "Password123!",
        },
      },
    );

    const button = screen.getByRole("button", {
      name: /login/i,
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    resolveLogin({
      user: {
        id: 1,
        email: "sarah.williams@example.com",
        displayName: "Sarah Williams",
        role: "REQUESTER",
        mustChangePassword: false,
        isActive: true,
      },
    });
  });
});