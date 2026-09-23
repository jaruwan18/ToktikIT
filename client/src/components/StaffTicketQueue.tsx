import { useEffect, useMemo, useState } from "react";
import {
  getItTickets,
  type ItPriority,
  type ItTicketListItem,
  type CurrentStatus,
} from "../api.js";

type SortField =
  | "ticketNumber"
  | "createdAt"
  | "summary"
  | "requester"
  | "owner"
  | "currentStatus"
  | "itPriority";

type SortOrder = "asc" | "desc";

const STATUS_OPTIONS: Array<{
  value: CurrentStatus;
  label: string;
}> = [
  { value: "NEW", label: "New" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  {
    value: "WAITING_FOR_REQUESTER",
    label: "Waiting for Requester",
  },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
  { value: "REOPENED", label: "Reopened" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PRIORITY_OPTIONS: Array<{
  value: ItPriority;
  label: string;
}> = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

interface StaffTicketQueueProps {
  onOpenTicket: (ticketId: number) => void;
}

function getStatusLabel(status: CurrentStatus): string {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)
      ?.label ?? status
  );
}

function getPriorityLabel(priority: ItPriority): string {
  return (
    PRIORITY_OPTIONS.find((option) => option.value === priority)
      ?.label ?? priority
  );
}

function getStatusClass(status: CurrentStatus): string {
  switch (status) {
    case "NEW":
      return "status-new";
    case "OPEN":
      return "status-open";
    case "IN_PROGRESS":
      return "status-in-progress";
    case "WAITING_FOR_REQUESTER":
      return "status-waiting";
    case "RESOLVED":
      return "status-resolved";
    case "CLOSED":
      return "status-closed";
    case "REOPENED":
      return "status-reopened";
    case "CANCELLED":
      return "status-cancelled";
    default:
      return "status-new";
  }
}

function getPriorityClass(priority: ItPriority): string {
  switch (priority) {
    case "LOW":
      return "priority-low";
    case "MEDIUM":
      return "priority-medium";
    case "HIGH":
      return "priority-high";
    default:
      return "";
  }
}

function getOwnerLabel(ticket: ItTicketListItem): string {
  return ticket.owner?.displayName ?? "Unassigned";
}

function getRequesterLabel(ticket: ItTicketListItem): string {
  return ticket.requester?.name ?? "Unknown requester";
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

function compareValues(
  left: string,
  right: string,
  order: SortOrder,
): number {
  const result = left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: "base",
  });

  return order === "asc" ? result : -result;
}

export default function StaffTicketQueue({
  onOpenTicket,
}: StaffTicketQueueProps) {
  const [tickets, setTickets] = useState<ItTicketListItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
      useState<CurrentStatus | "">("");

    const [priorityFilter, setPriorityFilter] =
      useState<ItPriority | "">("");
 
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [sortField, setSortField] =
    useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] =
    useState<SortOrder>("desc");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadQueue() {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await getItTickets({
        search: search.trim() || undefined,
        currentStatus:
          statusFilter || undefined,
        itPriority:
          priorityFilter || undefined,
        page,
        pageSize,
      });

      setTickets(response.data);
      setTotalItems(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      setTickets([]);
      setTotalItems(0);
      setTotalPages(0);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to retrieve IT Staff tickets.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQueue();
  }, [
    search,
    statusFilter,
    priorityFilter,
    page,
  ]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value as CurrentStatus | "");
    setPage(1);
  }

  function handlePriorityChange(value: string) {
    setPriorityFilter(value as ItPriority | "");
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setPage(1);
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder((current) =>
        current === "asc" ? "desc" : "asc",
      );
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  function getSortIndicator(field: SortField): string {
    if (sortField !== field) {
      return "";
    }

    return sortOrder === "asc" ? " ↑" : " ↓";
  }

  const sortedTickets = useMemo(() => {
    const copied = [...tickets];

    copied.sort((left, right) => {
      switch (sortField) {
        case "ticketNumber":
          return compareValues(
            left.ticketNumber,
            right.ticketNumber,
            sortOrder,
          );

        case "summary":
          return compareValues(
            left.summary,
            right.summary,
            sortOrder,
          );

        case "requester":
          return compareValues(
            getRequesterLabel(left),
            getRequesterLabel(right),
            sortOrder,
          );

        case "owner":
          return compareValues(
            getOwnerLabel(left),
            getOwnerLabel(right),
            sortOrder,
          );

        case "currentStatus":
          return compareValues(
            getStatusLabel(left.currentStatus),
            getStatusLabel(right.currentStatus),
            sortOrder,
          );

        case "itPriority":
          return compareValues(
            getPriorityLabel(left.itPriority),
            getPriorityLabel(right.itPriority),
            sortOrder,
          );

        case "createdAt": {
          const leftTime = new Date(
            left.createdAt,
          ).getTime();
          const rightTime = new Date(
            right.createdAt,
          ).getTime();

          return sortOrder === "asc"
            ? leftTime - rightTime
            : rightTime - leftTime;
        }

        default:
          return 0;
      }
    });

    return copied;
  }, [tickets, sortField, sortOrder]);

  const firstItem =
    totalItems === 0
      ? 0
      : (page - 1) * pageSize + 1;

  const lastItem = Math.min(
    page * pageSize,
    totalItems,
  );

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "" ||
    priorityFilter !== "";

  return (
    <section>
      <div className="page-header">
        <h1 className="page-title mb-1">
          IT Staff Ticket Queue
        </h1>

        <p className="page-subtitle">
          Review, search, and manage tickets assigned to the
          IT Service Desk.
        </p>
      </div>

      <section className="filter-panel mb-4">
        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <label
              htmlFor="staff-ticket-search"
              className="filter-label"
            >
              Search
            </label>

            <input
              id="staff-ticket-search"
              type="search"
              className="form-control"
              placeholder="Search by ticket number or summary..."
              value={search}
              onChange={(event) =>
                handleSearch(event.target.value)
              }
            />
          </div>

          <div className="col-12 col-md-6 col-lg-2">
            <label
              htmlFor="staff-status-filter"
              className="filter-label"
            >
              Status
            </label>

            <select
              id="staff-status-filter"
              className="form-select"
              value={statusFilter}
              onChange={(event) =>
                handleStatusChange(event.target.value)
              }
            >
              <option value="">All</option>

              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6 col-lg-2">
            <label
              htmlFor="staff-priority-filter"
              className="filter-label"
            >
              IT Priority
            </label>

            <select
              id="staff-priority-filter"
              className="form-select"
              value={priorityFilter}
              onChange={(event) =>
                handlePriorityChange(event.target.value)
              }
            >
              <option value="">All</option>

              {PRIORITY_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-lg-2 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-outline-success w-100"
              onClick={clearFilters}
              disabled={!hasFilters}
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <div
          className="zen-alert zen-alert-error d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3"
          role="alert"
        >
          <div>
            <div className="fw-semibold mb-1">
              Unable to load ticket queue
            </div>
            <div>{errorMessage}</div>
          </div>

          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={() => void loadQueue()}
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <section className="zen-card">
          <div className="zen-card-body">
            <div className="staff-queue-loading">
              <div className="skeleton staff-queue-skeleton-row" />
              <div className="skeleton staff-queue-skeleton-row" />
              <div className="skeleton staff-queue-skeleton-row" />
              <div className="skeleton staff-queue-skeleton-row" />
            </div>

            <div
              className="text-center text-muted mt-3"
              role="status"
            >
              Loading ticket queue...
            </div>
          </div>
        </section>
      ) : totalItems === 0 ? (
        <section className="zen-card">
          <div className="empty-state">
            {hasFilters ? (
              <>
                <h2>No tickets match your filters</h2>

                <p>
                  Try changing your search or filter
                  criteria.
                </p>

                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <h2>No tickets in the queue</h2>

                <p>
                  There are currently no tickets available
                  for IT Staff.
                </p>
              </>
            )}
          </div>
        </section>
      ) : (
        <>
          <section className="zen-card d-none d-lg-block">
            <div className="zen-card-body p-0">
              <div className="table-responsive">
                <table className="table zen-table">
                  <thead>
                    <tr>
                      <th scope="col">
                        <button
                          type="button"
                          className="sort-button"
                          onClick={() =>
                            handleSort("ticketNumber")
                          }
                        >
                          Ticket No.
                          {getSortIndicator(
                            "ticketNumber",
                          )}
                        </button>
                      </th>

                      <th scope="col">
                        <button
                          type="button"
                          className="sort-button"
                          onClick={() =>
                            handleSort("createdAt")
                          }
                        >
                          Created
                          {getSortIndicator("createdAt")}
                        </button>
                      </th>

                      <th scope="col">
                        <button
                          type="button"
                          className="sort-button"
                          onClick={() =>
                            handleSort("summary")
                          }
                        >
                          Summary
                          {getSortIndicator("summary")}
                        </button>
                      </th>

                      <th scope="col">
                        Requester
                      </th>

                      <th scope="col">
                        Owner
                      </th>

                      <th scope="col">
                        Status
                      </th>

                      <th scope="col">
                        IT Priority
                      </th>

                      <th scope="col">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedTickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>
                          <button
                            type="button"
                            className="ticket-link"
                            onClick={() =>
                              onOpenTicket(ticket.id)
                            }
                          >
                            {ticket.ticketNumber}
                          </button>
                        </td>

                        <td>
                          {formatDate(ticket.createdAt)}
                        </td>

                        <td>
                          <div className="staff-queue-summary">
                            {ticket.summary}
                          </div>
                        </td>

                        <td>
                          {getRequesterLabel(ticket)}
                        </td>

                        <td>
                          <span
                            className={
                              ticket.owner
                                ? ""
                                : "text-muted"
                            }
                          >
                            {getOwnerLabel(ticket)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              ticket.currentStatus,
                            )}`}
                          >
                            {getStatusLabel(
                              ticket.currentStatus,
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`priority-badge ${getPriorityClass(
                              ticket.itPriority,
                            )}`}
                          >
                            {getPriorityLabel(
                              ticket.itPriority,
                            )}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="btn btn-outline-success btn-sm"
                            onClick={() =>
                              onOpenTicket(ticket.id)
                            }
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="d-none d-md-block d-lg-none">
            <div className="zen-card">
              <div className="zen-card-body p-0">
                <div className="table-responsive">
                  <table className="table zen-table">
                    <thead>
                      <tr>
                        <th scope="col">
                          Ticket No.
                        </th>
                        <th scope="col">
                          Summary
                        </th>
                        <th scope="col">
                          Requester
                        </th>
                        <th scope="col">
                          Status
                        </th>
                        <th scope="col">
                          IT Priority
                        </th>
                        <th scope="col">
                          Owner
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {sortedTickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>
                            <button
                              type="button"
                              className="ticket-link"
                              onClick={() =>
                                onOpenTicket(ticket.id)
                              }
                            >
                              {ticket.ticketNumber}
                            </button>
                          </td>

                          <td>
                            {ticket.summary}
                          </td>

                          <td>
                            {getRequesterLabel(ticket)}
                          </td>

                          <td>
                            <span
                              className={`status-badge ${getStatusClass(
                                ticket.currentStatus,
                              )}`}
                            >
                              {getStatusLabel(
                                ticket.currentStatus,
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`priority-badge ${getPriorityClass(
                                ticket.itPriority,
                              )}`}
                            >
                              {getPriorityLabel(
                                ticket.itPriority,
                              )}
                            </span>
                          </td>

                          <td>
                            {getOwnerLabel(ticket)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <section className="d-md-none">
            <div className="d-flex flex-column gap-3">
              {sortedTickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className="ticket-card"
                >
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <div className="small text-muted mb-1">
                        Ticket No.
                      </div>

                      <button
                        type="button"
                        className="ticket-link"
                        onClick={() =>
                          onOpenTicket(ticket.id)
                        }
                      >
                        <strong>
                          {ticket.ticketNumber}
                        </strong>
                      </button>
                    </div>

                    <span
                      className={`status-badge ${getStatusClass(
                        ticket.currentStatus,
                      )}`}
                    >
                      {getStatusLabel(
                        ticket.currentStatus,
                      )}
                    </span>
                  </div>

                  <div className="ticket-card-summary">
                    {ticket.summary}
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <div className="small text-muted mb-1">
                        Requester
                      </div>

                      <div>
                        {getRequesterLabel(ticket)}
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="small text-muted mb-1">
                        Owner
                      </div>

                      <div>
                        {getOwnerLabel(ticket)}
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="small text-muted mb-1">
                        IT Priority
                      </div>

                      <span
                        className={`priority-badge ${getPriorityClass(
                          ticket.itPriority,
                        )}`}
                      >
                        {getPriorityLabel(
                          ticket.itPriority,
                        )}
                      </span>
                    </div>

                    <div className="col-12">
                      <div className="small text-muted">
                        Created:{" "}
                        {formatDate(ticket.createdAt)}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-success w-100 mt-3"
                    onClick={() =>
                      onOpenTicket(ticket.id)
                    }
                  >
                    Open Ticket
                  </button>
                </article>
              ))}
            </div>
          </section>

          <div className="zen-pagination">
            <div className="text-muted small">
              Showing {firstItem} to {lastItem} of{" "}
              {totalItems} tickets
            </div>

            {totalPages > 1 && (
              <nav aria-label="IT Staff ticket pagination">
                <ul className="pagination mb-0 flex-wrap">
                  <li
                    className={`page-item ${
                      page === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      disabled={page === 1}
                      onClick={() =>
                        setPage((current) =>
                          Math.max(1, current - 1),
                        )
                      }
                    >
                      Previous
                    </button>
                  </li>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((pageNumber) => (
                    <li
                      key={pageNumber}
                      className={`page-item ${
                        pageNumber === page
                          ? "active"
                          : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() =>
                          setPage(pageNumber)
                        }
                        aria-current={
                          pageNumber === page
                            ? "page"
                            : undefined
                        }
                      >
                        {pageNumber}
                      </button>
                    </li>
                  ))}

                  <li
                    className={`page-item ${
                      page === totalPages
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      disabled={
                        page === totalPages
                      }
                      onClick={() =>
                        setPage((current) =>
                          Math.min(
                            totalPages,
                            current + 1,
                          ),
                        )
                      }
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </>
      )}
    </section>
  );
}