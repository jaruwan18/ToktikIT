import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  createTicketAction,
  getTicketActions,
  updateTicketAction,
  type ActionTaken,
  type CreateActionTakenInput,
} from "../api.js";


interface ActionsTakenProps {
  ticketId: number;
  canEdit: boolean;
}

interface ActionFormState {
  actionDateTime: string;
  actionDescription: string;
  result: string;
  followUpRequired: boolean;
  followUpNote: string;
  attachmentNotes: string;
}

const emptyForm: ActionFormState = {
  actionDateTime: "",
  actionDescription: "",
  result: "",
  followUpRequired: false,
  followUpNote: "",
  attachmentNotes: "",
};

function toDateTimeLocal(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );

  return localDate.toISOString().slice(0, 16);
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function createIdempotencyKey(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `action-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function validateForm(
  form: ActionFormState,
): string | null {
  if (!form.actionDateTime) {
    return "Action Date/Time is required.";
  }

  if (
    Number.isNaN(
      new Date(form.actionDateTime).getTime(),
    )
  ) {
    return "Action Date/Time must be valid.";
  }

  if (!form.actionDescription.trim()) {
    return "Action Description is required.";
  }

  if (form.actionDescription.trim().length > 5000) {
    return "Action Description must be 5000 characters or fewer.";
  }

  if (!form.result.trim()) {
    return "Result is required.";
  }

  if (form.result.trim().length > 5000) {
    return "Result must be 5000 characters or fewer.";
  }

  if (
    form.followUpRequired &&
    !form.followUpNote.trim()
  ) {
    return "Follow-up Note is required.";
  }

  if (form.followUpNote.trim().length > 2000) {
    return "Follow-up Note must be 2000 characters or fewer.";
  }

  if (form.attachmentNotes.trim().length > 2000) {
    return "Attachment Notes must be 2000 characters or fewer.";
  }

  return null;
}

export default function ActionsTaken({
  ticketId,
  canEdit,
}: ActionsTakenProps) {
  const [actions, setActions] = useState<ActionTaken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formMode, setFormMode] = useState<
    "create" | "edit" | null
  >(null);
  const [editingActionId, setEditingActionId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<ActionFormState>(emptyForm);

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadActions() {
    setLoading(true);
    setError("");

    try {
      const response = await getTicketActions(ticketId);
      setActions(
        Array.isArray(response?.data) ? response.data : [],
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to retrieve Actions Taken.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadActions();
  }, [ticketId]);

  function startCreate() {
    setFormMode("create");
    setEditingActionId(null);
    setForm({
      ...emptyForm,
      actionDateTime: toDateTimeLocal(
        new Date().toISOString(),
      ),
    });
    setFormError("");
  }

  function startEdit(action: ActionTaken) {
    setFormMode("edit");
    setEditingActionId(action.id);

    setForm({
      actionDateTime: toDateTimeLocal(
        action.actionDateTime,
      ),
      actionDescription: action.actionDescription,
      result: action.result,
      followUpRequired: action.followUpRequired,
      followUpNote: action.followUpNote ?? "",
      attachmentNotes: action.attachmentNotes ?? "",
    });

    setFormError("");
  }

  function cancelForm() {
    if (submitting) {
      return;
    }

    setFormMode(null);
    setEditingActionId(null);
    setForm(emptyForm);
    setFormError("");
  }

  function updateField(
    field: keyof ActionFormState,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const validationError = validateForm(form);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const input: CreateActionTakenInput = {
      actionDateTime: new Date(
        form.actionDateTime,
      ).toISOString(),
      actionDescription:
        form.actionDescription.trim(),
      result: form.result.trim(),
      followUpRequired: form.followUpRequired,
      followUpNote: form.followUpRequired
        ? form.followUpNote.trim()
        : "",
      attachmentNotes: form.attachmentNotes.trim(),
    };

    setSubmitting(true);
    setFormError("");

    try {
      if (
        formMode === "edit" &&
        editingActionId !== null
      ) {
        const currentAction = actions.find(
          (action) =>
            action.id === editingActionId,
        );

        if (!currentAction) {
          throw new Error(
            "The Action Taken could not be found. Please reload the page.",
          );
        }

        await updateTicketAction(
          ticketId,
          editingActionId,
          {
            ...input,
            updatedAt: currentAction.updatedAt,
          },
        );
      } else {
        await createTicketAction(
          ticketId,
          input,
          createIdempotencyKey(),
        );
      }

      await loadActions();

      setFormMode(null);
      setEditingActionId(null);
      setForm(emptyForm);
      setFormError("");
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save Action Taken.",
      );

      /*
       * Important:
       * Do not clear the form after a recoverable error.
       * The user can retry without re-entering the data.
       */
      if (
        formMode === "edit" &&
        editingActionId !== null
      ) {
        try {
          await loadActions();
        } catch {
          // Keep the original form error and form data.
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className="zen-card shadow-sm mb-4"
      aria-labelledby={`actions-taken-title-${ticketId}`}
    >
      <div className="card-body p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h2
              id={`actions-taken-title-${ticketId}`}
              className="h5 mb-1"
            >
              Actions Taken
            </h2>

            <p className="text-muted mb-0">
              Record work performed on this ticket and
              its result.
            </p>
          </div>

          {canEdit && formMode === null && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={startCreate}
            >
              Add Action Taken
            </button>
          )}
        </div>

        {loading && (
          <div
            className="alert alert-secondary mb-3"
            role="status"
            aria-live="polite"
          >
            Loading Actions Taken...
          </div>
        )}

        {!loading && error && (
          <div
            className="alert alert-danger"
            role="alert"
          >
            <div className="fw-semibold mb-1">
              Unable to load Actions Taken.
            </div>

            <div className="mb-3">{error}</div>

            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => {
                void loadActions();
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {actions.length === 0 ? (
              <div
                className="alert alert-light border"
                role="status"
              >
                No Actions Taken yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle mb-0">
                  <caption className="visually-hidden">
                    Actions Taken for this ticket
                  </caption>

                  <thead>
                    <tr>
                      <th scope="col">
                        Action Date/Time
                      </th>
                      <th scope="col">
                        Action Description
                      </th>
                      <th scope="col">Result</th>
                      <th scope="col">Performed By</th>
                      <th scope="col">
                        Follow-Up Required
                      </th>
                      {canEdit && (
                        <th scope="col">Actions</th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {actions.map((action) => (
                      <tr key={action.id}>
                        <td>
                          {formatDateTime(
                            action.actionDateTime,
                          )}
                        </td>

                        <td>
                          <div>
                            {action.actionDescription}
                          </div>

                          {action.attachmentNotes && (
                            <div className="mt-2 small text-muted">
                              <strong>
                                Attachment Notes:
                              </strong>{" "}
                              {action.attachmentNotes}
                            </div>
                          )}
                        </td>

                        <td>{action.result}</td>

                        <td>
                          <div className="fw-semibold">
                            {
                              action.performedBy
                                .displayName
                            }
                          </div>

                          <div className="small text-muted">
                            {action.performedBy.email}
                          </div>
                        </td>

                        <td>
                          {action.followUpRequired ? (
                            <div>
                              <span className="badge text-bg-warning">
                                Required
                              </span>

                              {action.followUpNote && (
                                <div className="small mt-2">
                                  <strong>Note:</strong>{" "}
                                  {action.followUpNote}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="badge text-bg-secondary">
                              No
                            </span>
                          )}
                        </td>

                        {canEdit && (
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={() =>
                                startEdit(action)
                              }
                              disabled={submitting}
                            >
                              Edit
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {canEdit && formMode !== null && (
          <form
            className="border rounded p-3 mt-4"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h3 className="h6 mb-0">
                {formMode === "create"
                  ? "Add Action Taken"
                  : "Edit Action Taken"}
              </h3>

              <span className="small text-muted">
                Performed By is assigned automatically.
              </span>
            </div>

            {formError && (
              <div
                className="alert alert-danger"
                role="alert"
                aria-live="assertive"
              >
                {formError}
              </div>
            )}

            <fieldset disabled={submitting}>
              <legend className="visually-hidden">
                Action Taken details
              </legend>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label
                    htmlFor={`action-date-time-${ticketId}`}
                    className="form-label"
                  >
                    Action Date/Time
                  </label>

                  <input
                    id={`action-date-time-${ticketId}`}
                    type="datetime-local"
                    className="form-control"
                    value={form.actionDateTime}
                    onChange={(event) =>
                      updateField(
                        "actionDateTime",
                        event.target.value,
                      )
                    }
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label
                    htmlFor={`performed-by-${ticketId}`}
                    className="form-label"
                  >
                    Performed By
                  </label>

                  <input
                    id={`performed-by-${ticketId}`}
                    type="text"
                    className="form-control"
                    value="Automatically assigned to current IT Staff user"
                    readOnly
                    aria-readonly="true"
                   />
                </div>

                <div className="col-12">
                  <label
                    htmlFor={`action-description-${ticketId}`}
                    className="form-label"
                  >
                    Action Description
                  </label>

                  <textarea
                    id={`action-description-${ticketId}`}
                    className="form-control"
                    rows={4}
                    value={form.actionDescription}
                    onChange={(event) =>
                      updateField(
                        "actionDescription",
                        event.target.value,
                      )
                    }
                    maxLength={5000}
                    required
                  />
                </div>

                <div className="col-12">
                  <label
                    htmlFor={`action-result-${ticketId}`}
                    className="form-label"
                  >
                    Result
                  </label>

                  <textarea
                    id={`action-result-${ticketId}`}
                    className="form-control"
                    rows={4}
                    value={form.result}
                    onChange={(event) =>
                      updateField(
                        "result",
                        event.target.value,
                      )
                    }
                    maxLength={5000}
                    required
                  />
                </div>

                <div className="col-12">
                  <div className="form-check">
                    <input
                      id={`follow-up-required-${ticketId}`}
                      type="checkbox"
                      className="form-check-input"
                      checked={form.followUpRequired}
                      onChange={(event) => {
                        const checked = event.target.checked;

                        updateField(
                          "followUpRequired",
                          checked
                        );

                        if (
                          checked &&
                          !form.followUpNote.trim()
                        ) {
                          setFormError(
                            "Follow-up Note is required."
                          );
                        } else {
                          setFormError("");
                        }
                      }}
                     />

                    <label
                      htmlFor={`follow-up-required-${ticketId}`}
                      className="form-check-label"
                    >
                      Follow-Up Required?
                    </label>
                  </div>
                </div>

                {form.followUpRequired && (
                  <div className="col-12">
                    <label
                      htmlFor={`follow-up-note-${ticketId}`}
                      className="form-label"
                    >
                      Follow-up Note
                    </label>

                    <textarea
                      id={`follow-up-note-${ticketId}`}
                      className="form-control"
                      rows={3}
                      value={form.followUpNote}
                      onChange={(event) =>
                        updateField(
                          "followUpNote",
                          event.target.value,
                        )
                      }
                      maxLength={2000}
                      required
                    />
                  </div>
                )}

                <div className="col-12">
                  <label
                    htmlFor={`attachment-notes-${ticketId}`}
                    className="form-label"
                  >
                    Attachment Notes
                  </label>

                  <textarea
                    id={`attachment-notes-${ticketId}`}
                    className="form-control"
                    rows={3}
                    value={form.attachmentNotes}
                    onChange={(event) =>
                      updateField(
                        "attachmentNotes",
                        event.target.value,
                      )
                    }
                    maxLength={2000}
                  />
                </div>
              </div>
            </fieldset>

            <div className="d-flex flex-wrap gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : formMode === "create"
                    ? "Save Action Taken"
                    : "Save Changes"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={cancelForm}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
