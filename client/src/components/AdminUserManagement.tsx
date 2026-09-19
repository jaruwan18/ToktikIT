import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  createAdminUser,
  getAdminUsers,
  getCurrentUser,
  setAdminUserInitialPassword,
  updateAdminUser,
  type AdminUser,
  type CreateAdminUserInput,
  type CurrentUser,
  type UpdateAdminUserInput,
  type UserRole,
} from "../api.js";

type UserFormMode = "create" | "edit";

interface UserForm {
  displayName: string;
  email: string;
  role: UserRole;
  password: string;
}

interface PasswordForm {
  password: string;
}

const EMPTY_USER_FORM: UserForm = {
  displayName: "",
  email: "",
  role: "REQUESTER",
  password: "",
};

const EMPTY_PASSWORD_FORM: PasswordForm = {
  password: "",
};

const ROLES: UserRole[] = [
  "REQUESTER",
  "IT_STAFF",
  "ADMIN",
];

function roleLabel(role: UserRole) {
  switch (role) {
    case "REQUESTER":
      return "Requester";
    case "IT_STAFF":
      return "IT Staff";
    case "ADMIN":
      return "Administrator";
    default:
      return role;
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function getRoleBadgeClass(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "admin-role-badge";
    case "IT_STAFF":
      return "staff-role-badge";
    case "REQUESTER":
      return "requester-role-badge";
    default:
      return "";
  }
}

export default function AdminUserManagement() {
  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [formMode, setFormMode] =
    useState<UserFormMode>("create");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] =
    useState<AdminUser | null>(null);

  const [userForm, setUserForm] =
    useState<UserForm>(EMPTY_USER_FORM);

  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] =
    useState<Record<string, string>>({});
  const [formSubmitting, setFormSubmitting] =
    useState(false);

  const [passwordOpen, setPasswordOpen] =
    useState(false);
  const [passwordUser, setPasswordUser] =
    useState<AdminUser | null>(null);
  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>(EMPTY_PASSWORD_FORM);
  const [passwordError, setPasswordError] =
    useState("");
  const [passwordSubmitting, setPasswordSubmitting] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [updatingUserId, setUpdatingUserId] =
    useState<number | null>(null);

  const isAdmin = currentUser?.role === "ADMIN";

  const visibleUsers = useMemo(
    () => users,
    [users],
  );

  async function loadCurrentUser() {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (user.role !== "ADMIN") {
        setErrorMessage(
          "You do not have permission to manage users.",
        );
      }
    } catch (error) {
      setCurrentUser(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "You must be logged in.",
      );
    }
  }

  async function loadUsers(
    nextSearch = search,
  ) {
    setLoading(true);
    setErrorMessage("");

    try {
      const response =
        await getAdminUsers(nextSearch);

      setUsers(response.data);
    } catch (error) {
      setUsers([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to retrieve users.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        const user = await getCurrentUser();

        if (cancelled) {
          return;
        }

        setCurrentUser(user);

        if (user.role !== "ADMIN") {
          setErrorMessage(
            "You do not have permission to manage users.",
          );
          setLoading(false);
          return;
        }

        const response =
          await getAdminUsers("");

        if (cancelled) {
          return;
        }

        setUsers(response.data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setCurrentUser(null);
        setUsers([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load Administrator User Management.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSearchSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const nextSearch = searchInput.trim();

    setSearch(nextSearch);
    setSuccessMessage("");

    void loadUsers(nextSearch);
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
    setSuccessMessage("");

    void loadUsers("");
  }

  function openCreateForm() {
    setFormMode("create");
    setSelectedUser(null);
    setUserForm(EMPTY_USER_FORM);
    setFieldErrors({});
    setFormError("");
    setFormOpen(true);
    setSuccessMessage("");
  }

  function openEditForm(user: AdminUser) {
    setFormMode("edit");
    setSelectedUser(user);

    setUserForm({
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      password: "",
    });

    setFieldErrors({});
    setFormError("");
    setFormOpen(true);
    setSuccessMessage("");
  }

  function closeForm() {
    if (formSubmitting) {
      return;
    }

    setFormOpen(false);
    setSelectedUser(null);
    setUserForm(EMPTY_USER_FORM);
    setFieldErrors({});
    setFormError("");
  }

  function updateUserForm(
    field: keyof UserForm,
    value: string,
  ) {
    setUserForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: "",
    }));

    setFormError("");
  }

  function validateUserForm() {
    const errors: Record<string, string> = {};

    const displayName =
      userForm.displayName.trim();

    const email = userForm.email.trim();

    if (!displayName) {
      errors.displayName =
        "Display name is required.";
    } else if (displayName.length > 100) {
      errors.displayName =
        "Display name must not exceed 100 characters.";
    }

    if (!email) {
      errors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      errors.email =
        "Please enter a valid email address.";
    }

    if (!ROLES.includes(userForm.role)) {
      errors.role = "Please select a valid role.";
    }

    if (formMode === "create") {
      if (!userForm.password) {
        errors.password =
          "Initial password is required.";
      } else if (
        userForm.password.length < 8 ||
        userForm.password.length > 100
      ) {
        errors.password =
          "Password must be between 8 and 100 characters.";
      }
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleUserFormSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!validateUserForm()) {
      return;
    }

    setFormSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      if (formMode === "create") {
        const input: CreateAdminUserInput = {
          displayName:
            userForm.displayName.trim(),
          email: userForm.email.trim(),
          role: userForm.role,
          password: userForm.password,
        };

        await createAdminUser(input);

        setFormOpen(false);
        setUserForm(EMPTY_USER_FORM);

        setSuccessMessage(
          "User created successfully.",
        );

        await loadUsers(search);
      } else if (selectedUser) {
        const input: UpdateAdminUserInput = {
          displayName:
            userForm.displayName.trim(),
          email: userForm.email.trim(),
          role: userForm.role,
        };

        await updateAdminUser(
          selectedUser.id,
          input,
        );

        setFormOpen(false);
        setSelectedUser(null);

        setSuccessMessage(
          "User updated successfully.",
        );

        await loadUsers(search);
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save user.",
      );
    } finally {
      setFormSubmitting(false);
    }
  }

  function openPasswordForm(user: AdminUser) {
    setPasswordUser(user);
    setPasswordForm(EMPTY_PASSWORD_FORM);
    setPasswordError("");
    setPasswordOpen(true);
    setSuccessMessage("");
  }

  function closePasswordForm() {
    if (passwordSubmitting) {
      return;
    }

    setPasswordOpen(false);
    setPasswordUser(null);
    setPasswordForm(
      EMPTY_PASSWORD_FORM,
    );
    setPasswordError("");
  }

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!passwordUser) {
      return;
    }

    if (
      passwordForm.password.length < 8 ||
      passwordForm.password.length > 100
    ) {
      setPasswordError(
        "Password must be between 8 and 100 characters.",
      );
      return;
    }

    setPasswordSubmitting(true);
    setPasswordError("");
    setSuccessMessage("");

    try {
      await setAdminUserInitialPassword(
        passwordUser.id,
        {
          password: passwordForm.password,
        },
      );

      setPasswordOpen(false);
      setPasswordUser(null);
      setPasswordForm(
        EMPTY_PASSWORD_FORM,
      );

      setSuccessMessage(
        `Initial password updated for ${passwordUser.displayName}.`,
      );

      await loadUsers(search);
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Unable to set initial password.",
      );
    } finally {
      setPasswordSubmitting(false);
    }
  }

  async function handleActivationChange(
    user: AdminUser,
  ) {
    const nextIsActive = !user.isActive;

    if (
      currentUser?.id === user.id &&
      !nextIsActive
    ) {
      setErrorMessage(
        "You cannot deactivate your own Administrator account.",
      );
      return;
    }

    const action = nextIsActive
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.displayName}?`,
    );

    if (!confirmed) {
      return;
    }

    setUpdatingUserId(user.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateAdminUser(user.id, {
        isActive: nextIsActive,
      });

      setSuccessMessage(
        `${user.displayName} has been ${nextIsActive ? "activated" : "deactivated"}.`,
      );

      await loadUsers(search);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update account status.",
      );
    } finally {
      setUpdatingUserId(null);
    }
  }

  function renderUserActions(user: AdminUser) {
    const isCurrentUser =
      currentUser?.id === user.id;

    const cannotDeactivateSelf =
      isCurrentUser &&
      user.role === "ADMIN" &&
      user.isActive;

    return (
      <div className="d-flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-outline-success btn-sm"
          onClick={() => openEditForm(user)}
        >
          Edit
        </button>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() =>
            openPasswordForm(user)
          }
        >
          Set Initial Password
        </button>

        <button
          type="button"
          className={
            user.isActive
              ? "btn btn-outline-danger btn-sm"
              : "btn btn-outline-success btn-sm"
          }
          onClick={() =>
            void handleActivationChange(user)
          }
          disabled={
            updatingUserId === user.id ||
            cannotDeactivateSelf
          }
          title={
            cannotDeactivateSelf
              ? "An Administrator cannot deactivate their own account."
              : undefined
          }
        >
          {updatingUserId === user.id
            ? "Saving..."
            : user.isActive
              ? "Deactivate"
              : "Activate"}
        </button>
      </div>
    );
  }

  if (currentUser && !isAdmin) {
    return (
      <section className="zen-card shadow-sm">
        <div
          className="zen-alert-error m-4"
          role="alert"
        >
          <strong>Access denied.</strong>
          <div>
            Administrator User Management is only
            available to Administrators.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="page-title mb-1">
            User Management
          </h1>

          <p className="page-subtitle mb-0">
            Manage user accounts, roles, and account
            activation.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="btn btn-success"
            onClick={openCreateForm}
          >
            Create User
          </button>
        )}
      </div>

      {successMessage && (
        <div
          className="zen-alert-success rounded p-3 mb-4"
          role="status"
        >
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          className="zen-alert-error rounded p-3 mb-4"
          role="alert"
        >
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
            <span>{errorMessage}</span>

            {isAdmin && (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  setErrorMessage("");
                  void loadUsers(search);
                }}
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <section className="zen-card shadow-sm">
          <div className="card-body p-4 text-center text-muted">
            Loading users...
          </div>
        </section>
      ) : (
        <>
          <section className="zen-card shadow-sm mb-4">
            <div className="card-body p-4">
              <form
                onSubmit={handleSearchSubmit}
                className="row g-3 align-items-end"
              >
                <div className="col-12 col-md-8">
                  <label
                    htmlFor="admin-user-search"
                    className="form-label"
                  >
                    Search users
                  </label>

                  <input
                    id="admin-user-search"
                    type="search"
                    className="form-control"
                    value={searchInput}
                    onChange={(event) =>
                      setSearchInput(
                        event.target.value,
                      )
                    }
                    placeholder="Search by name or email"
                  />
                </div>

                <div className="col-12 col-md-4 d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-success flex-grow-1"
                  >
                    Search
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={clearSearch}
                    disabled={!search}
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </section>

          {visibleUsers.length === 0 ? (
            <section className="zen-card shadow-sm">
              <div className="empty-state">
                <h2 className="h5">
                  No users found
                </h2>

                <p className="mb-0">
                  {search
                    ? "Try a different name or email."
                    : "There are currently no users to display."}
                </p>
              </div>
            </section>
          ) : (
            <>
              <section className="zen-card shadow-sm d-none d-md-block">
                <div className="table-responsive">
                  <table className="table zen-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th scope="col">
                          Name
                        </th>

                        <th scope="col">
                          Email
                        </th>

                        <th scope="col">
                          Role
                        </th>

                        <th scope="col">
                          Status
                        </th>

                        <th scope="col">
                          Created
                        </th>

                        <th scope="col">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {visibleUsers.map(
                        (user) => (
                          <tr key={user.id}>
                            <td>
                              <strong>
                                {user.displayName}
                              </strong>

                              {currentUser?.id ===
                                user.id && (
                                <span className="small text-muted d-block">
                                  Current account
                                </span>
                              )}
                            </td>

                            <td>
                              {user.email}
                            </td>

                            <td>
                              <span
                                className={`badge rounded-pill ${getRoleBadgeClass(
                                  user.role,
                                )}`}
                              >
                                {roleLabel(
                                  user.role,
                                )}
                              </span>
                            </td>

                            <td>
                              <span
                                className={
                                  user.isActive
                                    ? "badge rounded-pill status-active"
                                    : "badge rounded-pill status-inactive"
                                }
                              >
                                {user.isActive
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </td>

                            <td>
                              {formatDate(
                                user.createdAt,
                              )}
                            </td>

                            <td>
                              {renderUserActions(
                                user,
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="d-md-none">
                <div className="d-flex flex-column gap-3">
                  {visibleUsers.map(
                    (user) => (
                      <article
                        key={user.id}
                        className="zen-card shadow-sm"
                      >
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                            <div>
                              <h2 className="h6 mb-1">
                                {user.displayName}
                              </h2>

                              {currentUser?.id ===
                                user.id && (
                                <div className="small text-muted">
                                  Current account
                                </div>
                              )}
                            </div>

                            <span
                              className={
                                user.isActive
                                  ? "badge rounded-pill status-active"
                                  : "badge rounded-pill status-inactive"
                              }
                            >
                              {user.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>

                          <div className="mb-3">
                            <div className="small text-muted mb-1">
                              Email
                            </div>

                            <div className="text-break">
                              {user.email}
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="small text-muted mb-1">
                              Role
                            </div>

                            <span
                              className={`badge rounded-pill ${getRoleBadgeClass(
                                user.role,
                              )}`}
                            >
                              {roleLabel(
                                user.role,
                              )}
                            </span>
                          </div>

                          <div className="small text-muted mb-3">
                            Created:{" "}
                            {formatDate(
                              user.createdAt,
                            )}
                          </div>

                          {renderUserActions(
                            user,
                          )}
                        </div>
                      </article>
                    ),
                  )}
                </div>
              </section>
            </>
          )}
        </>
      )}

      {formOpen && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
        >
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-form-title"
          >
            <div className="admin-modal-header">
              <div>
                <h2
                  id="user-form-title"
                  className="h5 mb-1"
                >
                  {formMode === "create"
                    ? "Create User"
                    : "Edit User"}
                </h2>

                <div className="small text-muted">
                  {formMode === "create"
                    ? "Create a new account with one permitted role."
                    : "Update the user's basic account information."}
                </div>
              </div>

              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={closeForm}
                disabled={formSubmitting}
              />
            </div>

            <form
              onSubmit={handleUserFormSubmit}
            >
              <div className="admin-modal-body">
                {formError && (
                  <div
                    className="zen-alert-error rounded p-3 mb-4"
                    role="alert"
                  >
                    {formError}
                  </div>
                )}

                <div className="mb-3">
                  <label
                    htmlFor="admin-user-name"
                    className="form-label"
                  >
                    Display Name
                  </label>

                  <input
                    id="admin-user-name"
                    type="text"
                    className={`form-control ${
                      fieldErrors.displayName
                        ? "is-invalid"
                        : ""
                    }`}
                    value={
                      userForm.displayName
                    }
                    onChange={(event) =>
                      updateUserForm(
                        "displayName",
                        event.target.value,
                      )
                    }
                    disabled={formSubmitting}
                    maxLength={100}
                  />

                  {fieldErrors.displayName && (
                    <div className="field-error">
                      {fieldErrors.displayName}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="admin-user-email"
                    className="form-label"
                  >
                    Email
                  </label>

                  <input
                    id="admin-user-email"
                    type="email"
                    className={`form-control ${
                      fieldErrors.email
                        ? "is-invalid"
                        : ""
                    }`}
                    value={userForm.email}
                    onChange={(event) =>
                      updateUserForm(
                        "email",
                        event.target.value,
                      )
                    }
                    disabled={formSubmitting}
                    maxLength={255}
                  />

                  {fieldErrors.email && (
                    <div className="field-error">
                      {fieldErrors.email}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="admin-user-role"
                    className="form-label"
                  >
                    Role
                  </label>

                  <select
                    id="admin-user-role"
                    className={`form-select ${
                      fieldErrors.role
                        ? "is-invalid"
                        : ""
                    }`}
                    value={userForm.role}
                    onChange={(event) =>
                      updateUserForm(
                        "role",
                        event.target.value,
                      )
                    }
                    disabled={formSubmitting}
                  >
                    {ROLES.map((role) => (
                      <option
                        key={role}
                        value={role}
                      >
                        {roleLabel(role)}
                      </option>
                    ))}
                  </select>

                  {fieldErrors.role && (
                    <div className="field-error">
                      {fieldErrors.role}
                    </div>
                  )}
                </div>

                {formMode === "create" && (
                  <div className="mb-3">
                    <label
                      htmlFor="admin-user-password"
                      className="form-label"
                    >
                      Initial Password
                    </label>

                    <input
                      id="admin-user-password"
                      type="password"
                      className={`form-control ${
                        fieldErrors.password
                          ? "is-invalid"
                          : ""
                      }`}
                      value={
                        userForm.password
                      }
                      onChange={(event) =>
                        updateUserForm(
                          "password",
                          event.target.value,
                        )
                      }
                      disabled={formSubmitting}
                      minLength={8}
                      maxLength={100}
                    />

                    <div className="helper-text">
                      8–100 characters. The user
                      will be required to change it
                      on the next login.
                    </div>

                    {fieldErrors.password && (
                      <div className="field-error">
                        {fieldErrors.password}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeForm}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={formSubmitting}
                >
                  {formSubmitting
                    ? "Saving..."
                    : formMode === "create"
                      ? "Create User"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordOpen && passwordUser && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
        >
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-form-title"
          >
            <div className="admin-modal-header">
              <div>
                <h2
                  id="password-form-title"
                  className="h5 mb-1"
                >
                  Set Initial Password
                </h2>

                <div className="small text-muted">
                  {passwordUser.displayName}
                </div>
              </div>

              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={closePasswordForm}
                disabled={passwordSubmitting}
              />
            </div>

            <form
              onSubmit={handlePasswordSubmit}
            >
              <div className="admin-modal-body">
                {passwordError && (
                  <div
                    className="zen-alert-error rounded p-3 mb-4"
                    role="alert"
                  >
                    {passwordError}
                  </div>
                )}

                <label
                  htmlFor="initial-password"
                  className="form-label"
                >
                  New Initial Password
                </label>

                <input
                  id="initial-password"
                  type="password"
                  className="form-control"
                  value={
                    passwordForm.password
                  }
                  onChange={(event) =>
                    setPasswordForm({
                      password:
                        event.target.value,
                    })
                  }
                  disabled={passwordSubmitting}
                  minLength={8}
                  maxLength={100}
                />

                <div className="helper-text">
                  The user must change this
                  password on their next login.
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closePasswordForm}
                  disabled={passwordSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={passwordSubmitting}
                >
                  {passwordSubmitting
                    ? "Saving..."
                    : "Set Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}