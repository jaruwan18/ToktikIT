import { useEffect, useState } from "react";
import {
  ALLOWED_STATUS_TRANSITIONS,
  TicketStatusError,
  updateTicketStatus,
  type CurrentStatus,
  type TicketStatusUpdateResult,
} from "../api.js";

interface TicketWorkflowProps {
  ticketId: number;
  currentStatus: CurrentStatus;
  onStatusChanged: (result: TicketStatusUpdateResult) => void;
  onRefreshRequested: () => void;
}

// Errors that mean the displayed Ticket is out of date.
const REFRESH_ERROR_CODES = new Set([
  "STALE_UPDATE",
  "INVALID_STATUS_TRANSITION",
]);

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function TicketWorkflow({
  ticketId,
  currentStatus,
  onStatusChanged,
  onRefreshRequested,
}: TicketWorkflowProps) {
  const nextStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  const [selectedStatus, setSelectedStatus] = useState<
    CurrentStatus | ""
  >("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setSelectedStatus("");
  }, [currentStatus]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedStatus || saving) {
      return;
    }

    setSaving(true);
    setError("");
    setErrorCode("");
    setSuccessMessage("");

    try {
      const result = await updateTicketStatus(
        ticketId,
        selectedStatus,
        currentStatus,
      );

      onStatusChanged(result);
      setSuccessMessage(
        `Status changed to ${formatLabel(result.currentStatus)}.`,
      );
    } catch (err) {
      if (err instanceof TicketStatusError) {
        setErrorCode(err.code);
        setError(err.message);
      } else {
        setError("Unable to change the Ticket status. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="zen-card shadow-sm mb-4">
      <div className="card-body p-4">
        <h2 className="h5 mb-3" id="ticket-workflow-heading">
          Ticket Workflow
        </h2>

        <p className="mb-3">
          <span className="small text-muted d-block">
            Current Status
          </span>
          <span className="fw-semibold">
            {formatLabel(currentStatus)}
          </span>
        </p>

        {nextStatuses.length === 0 ? (
          <p className="text-muted mb-0">
            No further status changes are available for this Ticket.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            aria-labelledby="ticket-workflow-heading"
          >
            <label
              htmlFor="ticket-next-status"
              className="form-label"
            >
              Change Status To
            </label>

            <select
              id="ticket-next-status"
              className="form-select mb-3"
              value={selectedStatus}
              disabled={saving}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value as CurrentStatus | "",
                )
              }
            >
              <option value="">Select a status</option>
              {nextStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={!selectedStatus || saving}
            >
              {saving ? "Saving..." : "Update Status"}
            </button>
          </form>
        )}

        {error && (
          <div
            className="alert alert-danger mt-3 mb-0"
            role="alert"
          >
            <p className="mb-0">{error}</p>

            {REFRESH_ERROR_CODES.has(errorCode) && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm mt-2"
                onClick={onRefreshRequested}
              >
                Refresh Ticket
              </button>
            )}
          </div>
        )}

        {successMessage && (
          <div
            className="alert alert-success mt-3 mb-0"
            role="status"
          >
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}
