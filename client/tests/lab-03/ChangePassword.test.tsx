import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ChangePassword from "../../src/components/ChangePassword";
import * as api from "../../src/api";

vi.mock("../../src/api", () => ({
  changePassword: vi.fn(),
}));

describe("Lab 3 - First Login Password Change", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders current password, new password, confirm password, and change button", () => {
    render(<ChangePassword onPasswordChanged={vi.fn()} />);

    expect(
      screen.getByLabelText(/current password|temporary password/i),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/^new password$/i),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/^confirm new password$/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /change password/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows validation when required fields are empty", async () => {
    render(<ChangePassword onPasswordChanged={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /change password/i,
      }),
    );

    expect(
      await screen.findByText(
        /current password is required|temporary password is required/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/^New password is required$/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/^Confirm new password is required$/i),
    ).toBeInTheDocument();

    expect(api.changePassword).not.toHaveBeenCalled();
  });

  it("shows an error when the new password is shorter than 8 characters", async () => {
    render(<ChangePassword onPasswordChanged={vi.fn()} />);

    fireEvent.change(
      screen.getByLabelText(/current password|temporary password/i),
      {
        target: { value: "Password123!" },
      },
    );

    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: { value: "short" },
    });

    fireEvent.change(
      screen.getByLabelText(/^confirm new password$/i),
      {
        target: { value: "short" },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /change password/i,
      }),
    );

    expect(
      await screen.findByText(
                /^New password must be at least 8 characters$/i,
            ),
    ).toBeInTheDocument();

    expect(api.changePassword).not.toHaveBeenCalled();
  });

  it("shows an error when the new password and confirmation do not match", async () => {
    render(<ChangePassword onPasswordChanged={vi.fn()} />);

    fireEvent.change(
      screen.getByLabelText(/current password|temporary password/i),
      {
        target: { value: "Password123!" },
      },
    );

    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: { value: "NewPassword123!" },
    });

    fireEvent.change(
      screen.getByLabelText(/^confirm new password$/i),
      {
        target: { value: "DifferentPassword123!" },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /change password/i,
      }),
    );

    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument();

    expect(api.changePassword).not.toHaveBeenCalled();
  });

  it("calls changePassword with the entered passwords", async () => {
    vi.mocked(api.changePassword).mockResolvedValue({
      message: "Password changed successfully",
    });

    const onPasswordChanged = vi.fn();

    render(
      <ChangePassword
        onPasswordChanged={onPasswordChanged}
      />,
    );

    fireEvent.change(
      screen.getByLabelText(/current password|temporary password/i),
      {
        target: { value: "Password123!" },
      },
    );

    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: { value: "NewPassword123!" },
    });

    fireEvent.change(
      screen.getByLabelText(/^confirm new password$/i),
      {
        target: { value: "NewPassword123!" },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /change password/i,
      }),
    );

    await waitFor(() => {
      expect(api.changePassword).toHaveBeenCalledWith(
        "Password123!",
        "NewPassword123!",
      );
    });

    expect(onPasswordChanged).toHaveBeenCalled();
  });

  it("shows the API error when changing the password fails", async () => {
    vi.mocked(api.changePassword).mockRejectedValue(
      new Error("Current password is incorrect"),
    );

    render(<ChangePassword onPasswordChanged={vi.fn()} />);

    fireEvent.change(
      screen.getByLabelText(/current password|temporary password/i),
      {
        target: { value: "WrongPassword!" },
      },
    );

    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: { value: "NewPassword123!" },
    });

    fireEvent.change(
      screen.getByLabelText(/^confirm new password$/i),
      {
        target: { value: "NewPassword123!" },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /change password/i,
      }),
    );

    expect(
      await screen.findByText(/current password is incorrect/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /change password/i,
      }),
    ).toBeInTheDocument();
  });

  it("disables the button while the password is being changed", async () => {
    let resolveChangePassword!: (value: {
      message: string;
    }) => void;

    vi.mocked(api.changePassword).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveChangePassword = resolve;
        }),
    );

    render(<ChangePassword onPasswordChanged={vi.fn()} />);

    fireEvent.change(
      screen.getByLabelText(/current password|temporary password/i),
      {
        target: { value: "Password123!" },
      },
    );

    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: { value: "NewPassword123!" },
    });

    fireEvent.change(
      screen.getByLabelText(/^confirm new password$/i),
      {
        target: { value: "NewPassword123!" },
      },
    );

    const button = screen.getByRole("button", {
      name: /change password/i,
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    resolveChangePassword({
      message: "Password changed successfully",
    });
  });
});
