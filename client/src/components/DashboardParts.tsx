import type {
  CurrentStatus,
  DashboardTicket,
  DrillDownFilter,
  ItPriority,
} from "../api.js";

// Shared building blocks for the Lab 4 Requester and IT Staff dashboards.

export const STATUS_LABELS: Record<CurrentStatus, string> = {
  NEW: "New",
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  WAITING_FOR_REQUESTER: "Waiting for Requester",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REOPENED: "Reopened",
  CANCELLED: "Cancelled",
};

export const STATUS_ORDER: CurrentStatus[] = [
  "NEW",
  "OPEN",
  "IN_PROGRESS",
  "WAITING_FOR_REQUESTER",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
  "CANCELLED",
];

export const PRIORITY_LABELS: Record<ItPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const PRIORITY_ORDER: ItPriority[] = ["HIGH", "MEDIUM", "LOW"];

const STATUS_CLASSES: Record<CurrentStatus, string> = {
  NEW: "status-new",
  OPEN: "status-open",
  IN_PROGRESS: "status-in-progress",
  WAITING_FOR_REQUESTER: "status-waiting",
  RESOLVED: "status-resolved",
  CLOSED: "status-closed",
  REOPENED: "status-reopened",
  CANCELLED: "status-cancelled",
};

// Dates are shown in the Asia/Bangkok timezone (ui-spec / api-spec).
export function formatDashboardDate(value: string): string {
  return new Date(value).toLocaleString("en-GB", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// A human-readable description of a drill-down filter, shown above the
// filtered Ticket list so the user knows why the list is narrowed.
export function describeDrillDown(filter: DrillDownFilter): string {
  const parts: string[] = [];

  if (filter.owner === "unassigned") {
    parts.push("Unassigned");
  } else if (filter.owner === "me") {
    parts.push("Owned by me");
  }

  if (filter.statusGroup === "active") {
    parts.push("Active");
  } else if (filter.statusGroup === "resolved") {
    parts.push("Resolved or Closed");
  }

  if (filter.currentStatus) {
    parts.push(`Status: ${STATUS_LABELS[filter.currentStatus]}`);
  }

  if (filter.itPriority) {
    parts.push(`IT Priority: ${PRIORITY_LABELS[filter.itPriority]}`);
  }

  if (filter.updatedWithinDays !== undefined) {
    parts.push(`Updated in the last ${filter.updatedWithinDays} days`);
  }

  return parts.join(" · ");
}

interface MetricCardProps {
  label: string;
  value: number;
  description?: string;
  onOpen?: () => void;
}

// Actionable cards are real buttons so they work with the keyboard and
// show a visible focus ring; informational cards are plain text.
export function MetricCard({
  label,
  value,
  description,
  onOpen,
}: MetricCardProps) {
  const content = (
    <>
      <span className="dashboard-metric-label">{label}</span>
      <span className="dashboard-metric-value">{value}</span>
      {description ? (
        <span className="dashboard-metric-description">
          {description}
        </span>
      ) : null}
      {onOpen ? (
        <span className="dashboard-metric-link" aria-hidden="true">
          View tickets →
        </span>
      ) : null}
    </>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        className="dashboard-metric dashboard-metric-action"
        onClick={onOpen}
        aria-label={`${label}: ${value}. View tickets`}
      >
        {content}
      </button>
    );
  }

  return <div className="dashboard-metric">{content}</div>;
}

export function MetricCardSkeleton() {
  return (
    <div className="dashboard-metric" aria-hidden="true">
      <span className="skeleton d-block mb-2" style={{ height: 16, width: "60%" }} />
      <span className="skeleton d-block" style={{ height: 32, width: "30%" }} />
    </div>
  );
}

export function StatusBadge({ status }: { status: CurrentStatus }) {
  return (
    <span className={`status-badge ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

interface DashboardTicketListProps {
  title: string;
  tickets: DashboardTicket[];
  emptyMessage: string;
  showItPriority?: boolean;
  onOpenTicket: (ticketId: number) => void;
}

export function DashboardTicketList({
  title,
  tickets,
  emptyMessage,
  showItPriority = false,
  onOpenTicket,
}: DashboardTicketListProps) {
  const headingId = `dashboard-list-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <section className="zen-card h-100" aria-labelledby={headingId}>
      <div className="zen-card-header">
        <h2 id={headingId} className="h6 mb-0">
          {title}
        </h2>
      </div>

      {tickets.length === 0 ? (
        <p className="text-muted p-3 mb-0">{emptyMessage}</p>
      ) : (
        <ul className="list-unstyled mb-0 dashboard-ticket-list">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <button
                type="button"
                className="dashboard-ticket-row"
                onClick={() => onOpenTicket(ticket.id)}
              >
                <span className="d-flex justify-content-between gap-2 flex-wrap">
                  <span className="ticket-number">
                    {ticket.ticketNumber}
                  </span>
                  <span className="d-flex gap-1 flex-wrap">
                    {showItPriority ? (
                      <span
                        className={`priority-badge priority-${ticket.itPriority.toLowerCase()}`}
                      >
                        {PRIORITY_LABELS[ticket.itPriority]}
                      </span>
                    ) : null}
                    <StatusBadge status={ticket.currentStatus} />
                  </span>
                </span>
                <span className="d-block text-start text-truncate">
                  {ticket.summary}
                </span>
                <span className="d-block text-start small text-muted">
                  Updated {formatDashboardDate(ticket.updatedAt)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

interface DashboardErrorStateProps {
  message: string;
  forbidden: boolean;
  onRetry: () => void;
}

export function DashboardErrorState({
  message,
  forbidden,
  onRetry,
}: DashboardErrorStateProps) {
  return (
    <div
      className="zen-alert-error rounded p-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3"
      role="alert"
    >
      <span>{message}</span>
      {forbidden ? null : (
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
}
