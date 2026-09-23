import { useEffect, useState } from "react";
import {
  getItTicketDetail,
  type ItTicketDetail,
} from "../api.js";

interface StaffTicketDetailProps {
  ticketId: number;
  onBack: () => void;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function priorityClass(priority: string) {
  switch (priority) {
    case "HIGH":
      return "text-danger";
    case "MEDIUM":
      return "text-warning";
    case "LOW":
      return "text-success";
    default:
      return "text-muted";
  }
}

export default function StaffTicketDetail({
  ticketId,
  onBack,
}: StaffTicketDetailProps) {
  const [ticket, setTicket] = useState<ItTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  async function loadTicket() {
    setLoading(true);
    setError("");
    setTicket(null);
    setNotFound(false);

    try {
      const response = await getItTicketDetail(ticketId);
      setTicket(response);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to retrieve IT Staff ticket detail.";

      if (message === "Ticket not found.") {
        setNotFound(true);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTicket();
  }, [ticketId]);

  if (loading) {
    return (
      <section className="zen-card shadow-sm">
        <div className="card-body p-4 text-center">
          <p className="mb-0">Loading...</p>
        </div>
      </section>
    );
  }

  if (notFound) {
    return (
      <section className="zen-card shadow-sm">
        <div className="card-body p-4 text-center">
          <h2 className="h5">Ticket not found</h2>

          <p className="text-muted mb-3">
            The requested ticket could not be found.
          </p>

          <button
            type="button"
            className="btn btn-outline-success"
            onClick={onBack}
          >
            Back to IT Ticket Queue
          </button>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="zen-card shadow-sm">
        <div className="card-body p-4 text-center">
          <h2 className="h5">Unable to load ticket</h2>

          <p className="text-danger mb-3">{error}</p>

          <div className="d-flex justify-content-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onBack}
            >
              Back to IT Ticket Queue
            </button>

            <button
              type="button"
              className="btn btn-success"
              onClick={() => void loadTicket()}
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <section>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <button
            type="button"
            className="btn btn-link p-0 mb-2 text-decoration-none"
            onClick={onBack}
          >
            ← Back to IT Ticket Queue
          </button>

          <h1 className="page-title mb-1">
            {ticket.ticketNumber}
          </h1>

          <p className="page-subtitle mb-0">
            IT Staff Ticket Detail
          </p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="zen-card shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                <div>
                  <p className="text-muted mb-1">
                    Ticket Number
                  </p>

                  <h2 className="h4 mb-0">
                    {ticket.ticketNumber}
                  </h2>
                </div>

                <div className="d-flex gap-2 flex-wrap">
                  <span className="badge text-bg-light border">
                    {formatLabel(ticket.currentStatus)}
                  </span>

                  <span
                    className={`badge bg-light border ${priorityClass(
                      ticket.itPriority,
                    )}`}
                  >
                    IT Priority:{" "}
                    {formatLabel(ticket.itPriority)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h2 className="h5 mb-2">
                  {ticket.summary}
                </h2>

                <p className="mb-0 text-break">
                  {ticket.description}
                </p>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="small text-muted">
                    Requested Priority
                  </div>

                  <div className="fw-semibold">
                    {formatLabel(ticket.requestedPriority)}
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="small text-muted">
                    Current Status
                  </div>

                  <div className="fw-semibold">
                    {formatLabel(ticket.currentStatus)}
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="small text-muted">
                    Created
                  </div>

                  <div className="fw-semibold">
                    {formatDate(ticket.createdAt)}
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="small text-muted">
                    Updated
                  </div>

                  <div className="fw-semibold">
                    {formatDate(ticket.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="zen-card shadow-sm mb-4">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">
                Messages
              </h2>

              {ticket.messages.length === 0 ? (
                <p className="text-muted mb-0">
                  No messages yet.
                </p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {ticket.messages.map((message) => (
                    <div
                      key={message.id}
                      className="border rounded p-3"
                    >
                      <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-2">
                        <div>
                          <strong>
                            {message.author.displayName}
                          </strong>

                          <div className="small text-muted">
                            {message.author.email}
                          </div>
                        </div>

                        <div className="small text-muted">
                          {formatDate(message.createdAt)}
                        </div>
                      </div>

                      <div className="small text-muted mb-2">
                        {formatLabel(message.type)}
                      </div>

                      <p className="mb-0 text-break">
                        {message.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="zen-card shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">
                Attachments
              </h2>

              {ticket.attachments.length === 0 ? (
                <p className="text-muted mb-0">
                  No attachments.
                </p>
              ) : (
                <div className="list-group">
                  {ticket.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="list-group-item"
                    >
                      <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
                        <div>
                          <div className="fw-semibold text-break">
                            {attachment.originalFilename}
                          </div>

                          <div className="small text-muted">
                            {attachment.mimeType} ·{" "}
                            {attachment.sizeBytes} bytes
                          </div>
                        </div>

                        <div className="small">
                          {attachment.isRemoved ? (
                            <span className="text-danger">
                              Removed
                            </span>
                          ) : (
                            <span className="text-success">
                              Available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="zen-card shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">
                Ticket Information
              </h2>

              <div className="mb-3">
                <div className="small text-muted">
                  Requester
                </div>

                <div className="fw-semibold">
                  {ticket.requesterName}
                </div>

                <div className="small text-muted text-break">
                  {ticket.requester.email}
                </div>
              </div>

              <div className="mb-3">
                <div className="small text-muted">
                  Category
                </div>

                <div className="fw-semibold">
                  {ticket.categoryName}
                </div>
              </div>

              <div className="mb-3">
                <div className="small text-muted">
                  Related System
                </div>

                <div className="fw-semibold">
                  {ticket.relatedSystemName}
                </div>
              </div>

              <div className="mb-3">
                <div className="small text-muted">
                  Owner
                </div>

                {ticket.owner ? (
                  <>
                    <div className="fw-semibold">
                      {ticket.owner.displayName}
                    </div>

                    <div className="small text-muted text-break">
                      {ticket.owner.email}
                    </div>
                  </>
                ) : (
                  <div className="text-muted">
                    Unassigned
                  </div>
                )}
              </div>

              <div>
                <div className="small text-muted">
                  IT Priority
                </div>

                <div
                  className={`fw-semibold ${priorityClass(
                    ticket.itPriority,
                  )}`}
                >
                  {formatLabel(ticket.itPriority)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}