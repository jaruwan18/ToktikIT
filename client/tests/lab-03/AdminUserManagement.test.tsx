import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import AdminUserManagement from "../../src/components/AdminUserManagement.js";
import * as api from "../../src/api.js";

describe("Lab 3 - Administrator User Management UI", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(api, "getCurrentUser").mockResolvedValue({
      id: 8,
      email: "admin@example.com",
      displayName: "System Administrator",
      role: "ADMIN",
      isActive: true,
    });

    vi.spyOn(api, "getAdminUsers").mockResolvedValue({
      data: [
        {
          id: 1,
          email: "jennifer@example.com",
          displayName: "Jennifer Anderson",
          role: "REQUESTER",
          isActive: true,
          mustChangePassword: false,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: 2,
          email: "it.alex@example.com",
          displayName: "Alex Carter",
          role: "IT_STAFF",
          isActive: true,
          mustChangePassword: false,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: 8,
          email: "admin@example.com",
          displayName: "System Administrator",
          role: "ADMIN",
          isActive: true,
          mustChangePassword: false,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      pagination: {
        page: 1,
        pageSize: 50,
        total: 3,
        totalPages: 1,
      },
    });
  });

  it("shows the User Management screen and user list", async () => {
    render(<AdminUserManagement />);

    expect(
      await screen.findByRole("heading", {
        name: /User Management/i,
      }),
    ).toBeInTheDocument();

    expect(
      (await screen.findAllByText("Jennifer Anderson")).length,
    ).toBeGreaterThan(0);

    expect(
      (await screen.findAllByText("Alex Carter")).length,
    ).toBeGreaterThan(0);

    expect(
      (await screen.findAllByText("System Administrator")).length,
    ).toBeGreaterThan(0);
  });

  it("searches users by name or email", async () => {
    const getAdminUsersSpy = vi
      .spyOn(api, "getAdminUsers")
      .mockResolvedValueOnce({
        data: [
          {
            id: 1,
            email: "jennifer@example.com",
            displayName: "Jennifer Anderson",
            role: "REQUESTER",
            isActive: true,
            mustChangePassword: false,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
          {
            id: 2,
            email: "it.alex@example.com",
            displayName: "Alex Carter",
            role: "IT_STAFF",
            isActive: true,
            mustChangePassword: false,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
          {
            id: 8,
            email: "admin@example.com",
            displayName: "System Administrator",
            role: "ADMIN",
            isActive: true,
            mustChangePassword: false,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        pagination: {
          page: 1,
          pageSize: 50,
          total: 3,
          totalPages: 1,
        },
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 1,
            email: "jennifer@example.com",
            displayName: "Jennifer Anderson",
            role: "REQUESTER",
            isActive: true,
            mustChangePassword: false,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        pagination: {
          page: 1,
          pageSize: 50,
          total: 1,
          totalPages: 1,
        },
      });

    render(<AdminUserManagement />);

    const searchInput = await screen.findByRole("searchbox", {
      name: /Search users/i,
    });

    fireEvent.change(searchInput, {
      target: {
        value: "Jennifer",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /^Search$/i,
      }),
    );

    await waitFor(() => {
      expect(getAdminUsersSpy).toHaveBeenLastCalledWith(
        "Jennifer",
      );
    });

    expect(
      (await screen.findAllByText("Jennifer Anderson")).length,
    ).toBeGreaterThan(0);

    expect(
      screen.queryByText("Alex Carter"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("System Administrator"),
    ).not.toBeInTheDocument();
  });

  it("opens the Create User form", async () => {
    render(<AdminUserManagement />);

    const createButtons = await screen.findAllByRole("button", {
      name: /Create User/i,
    });

    fireEvent.click(createButtons[0]);

    expect(
      await screen.findByRole("heading", {
        name: /Create User/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", {
        name: /Display Name/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", {
        name: /Email/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("combobox", {
        name: /Role/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/Initial Password/i),
    ).toBeInTheDocument();
  });

  it("shows validation errors when creating a user with empty required fields", async () => {
    render(<AdminUserManagement />);

    const createButtons = await screen.findAllByRole("button", {
      name: /Create User/i,
    });

    fireEvent.click(createButtons[0]);

    const modalCreateButtons = await screen.findAllByRole(
      "button",
      {
        name: /Create User/i,
      },
    );

    fireEvent.click(
      modalCreateButtons[modalCreateButtons.length - 1],
    );

    expect(
      await screen.findByText(/Display name is required/i),
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/Email is required/i),
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/Initial password is required/i),
    ).toBeInTheDocument();
  });

  it("creates a new user", async () => {
    vi.spyOn(api, "createAdminUser").mockResolvedValue({
      id: 9,
      email: "new.user@example.com",
      displayName: "New User",
      role: "REQUESTER",
      isActive: true,
      mustChangePassword: true,
      createdAt: "2026-09-19T00:00:00.000Z",
      updatedAt: "2026-09-19T00:00:00.000Z",
    });

    render(<AdminUserManagement />);

    const createButtons = await screen.findAllByRole("button", {
      name: /Create User/i,
    });

    fireEvent.click(createButtons[0]);

    fireEvent.change(
      screen.getByRole("textbox", {
        name: /Display Name/i,
      }),
      {
        target: {
          value: "New User",
        },
      },
    );

    fireEvent.change(
      screen.getByRole("textbox", {
        name: /Email/i,
      }),
      {
        target: {
          value: "new.user@example.com",
        },
      },
    );

    const roleSelect = screen.getByRole("combobox", {
      name: /Role/i,
    });

    fireEvent.change(roleSelect, {
      target: {
        value: "REQUESTER",
      },
    });

    fireEvent.change(
      screen.getByLabelText(/Initial Password/i),
      {
        target: {
          value: "Password123!",
        },
      },
    );

    const modalCreateButtons = await screen.findAllByRole(
      "button",
      {
        name: /Create User/i,
      },
    );

    fireEvent.click(
      modalCreateButtons[modalCreateButtons.length - 1],
    );

    await waitFor(() => {
      expect(api.createAdminUser).toHaveBeenCalledTimes(1);
    });

    expect(api.createAdminUser).toHaveBeenCalledWith({
      displayName: "New User",
      email: "new.user@example.com",
      role: "REQUESTER",
      password: "Password123!",
    });
  });

  it("opens the Edit User form with existing user information", async () => {
    render(<AdminUserManagement />);

    const editButtons = await screen.findAllByRole("button", {
      name: /Edit/i,
    });

    fireEvent.click(editButtons[0]);

    expect(
      await screen.findByRole("heading", {
        name: /Edit User/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Jennifer Anderson"),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("jennifer@example.com"),
    ).toBeInTheDocument();
  });

  it("updates an existing user", async () => {
    vi.spyOn(api, "updateAdminUser").mockResolvedValue({
      id: 1,
      email: "jennifer.updated@example.com",
      displayName: "Jennifer Updated",
      role: "REQUESTER",
      isActive: true,
      mustChangePassword: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-09-19T00:00:00.000Z",
    });

    render(<AdminUserManagement />);

    const editButtons = await screen.findAllByRole("button", {
      name: /Edit/i,
    });

    fireEvent.click(editButtons[0]);

    const nameInput = await screen.findByDisplayValue(
      "Jennifer Anderson",
    );

    fireEvent.change(nameInput, {
      target: {
        value: "Jennifer Updated",
      },
    });

    const emailInput = screen.getByDisplayValue(
      "jennifer@example.com",
    );

    fireEvent.change(emailInput, {
      target: {
        value: "jennifer.updated@example.com",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /Save Changes/i,
      }),
    );

    await waitFor(() => {
      expect(api.updateAdminUser).toHaveBeenCalledTimes(1);
    });

    expect(api.updateAdminUser).toHaveBeenCalledWith(
      1,
      {
        displayName: "Jennifer Updated",
        email: "jennifer.updated@example.com",
        role: "REQUESTER",
      },
    );
  });

  it("allows setting a new initial password", async () => {
    vi.spyOn(api, "setAdminUserInitialPassword").mockResolvedValue({
      id: 1,
      email: "jennifer@example.com",
      displayName: "Jennifer Anderson",
      role: "REQUESTER",
      isActive: true,
      mustChangePassword: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-09-19T00:00:00.000Z",
    });

    render(<AdminUserManagement />);

    const passwordButtons = await screen.findAllByRole("button", {
      name: /Set Initial Password/i,
    });

    fireEvent.click(passwordButtons[0]);

    expect(
      await screen.findByRole("heading", {
        name: /Set Initial Password/i,
      }),
    ).toBeInTheDocument();
  });

  it("allows activating and deactivating users", async () => {
    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockReturnValue(true);

    vi.spyOn(api, "updateAdminUser").mockResolvedValue({
      id: 1,
      email: "jennifer@example.com",
      displayName: "Jennifer Anderson",
      role: "REQUESTER",
      isActive: false,
      mustChangePassword: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-09-19T00:00:00.000Z",
    });

    render(<AdminUserManagement />);

    const deactivateButtons = await screen.findAllByRole(
      "button",
      {
        name: /Deactivate/i,
      },
    );

    fireEvent.click(deactivateButtons[0]);

    expect(confirmSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(api.updateAdminUser).toHaveBeenCalledTimes(1);
    });

    expect(api.updateAdminUser).toHaveBeenCalledWith(
      1,
      {
        isActive: false,
      },
    );
  });

  it("shows an error when the user list cannot be loaded", async () => {
    vi.restoreAllMocks();

    vi.spyOn(api, "getCurrentUser").mockResolvedValue({
      id: 8,
      email: "admin@example.com",
      displayName: "System Administrator",
      role: "ADMIN",
      isActive: true,
    });

    vi.spyOn(api, "getAdminUsers").mockRejectedValue(
      new Error("Unable to retrieve users."),
    );

    render(<AdminUserManagement />);

    expect(
      await screen.findByText(/Unable to retrieve users/i),
    ).toBeInTheDocument();
  });
});
