import { useEffect, useState } from "react";
import {
  getCategories,
  getTickets,
  type Category,
  type TicketListItem,
  type TicketListParams,
} from "./api.js";

type Priority = "" | "LOW" | "MEDIUM" | "HIGH";
type Status = "" | "NEW";

type SortBy = NonNullable<TicketListParams["sortBy"]>;
type SortOrder = NonNullable<TicketListParams["sortOrder"]>;

export default function App() {
  const [requesterId] = useState<number>(1);

  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [requestedPriority, setRequestedPriority] =
    useState<Priority>("");
  const [currentStatus, setCurrentStatus] = useState<Status>("");

  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const hasActiveFilters =
    search.trim() !== "" ||
    categoryId !== "" ||
    requestedPriority !== "" ||
    currentStatus !== "";

  async function loadTickets() {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await getTickets({
        requesterId,
        search,
        categoryId: categoryId ? Number(categoryId) : undefined,
        requestedPriority: requestedPriority || undefined,
        currentStatus: currentStatus || undefined,
        sortBy,
        sortOrder,
        page,
        pageSize,
      });

      setTickets(response.data);
      setTotalItems(response.pagination.totalItems);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Unable to retrieve tickets.",
      );
      setTickets([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await getCategories();
        setCategories(response);
      } catch {
        setCategories([]);
      }
    }

    void loadCategories();
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [
    requesterId,
    search,
    categoryId,
    requestedPriority,
    currentStatus,
    sortBy,
    sortOrder,
    page,
    pageSize,
  ]);

  function clearFilters() {
    setSearch("");
    setCategoryId("");
    setRequestedPriority("");
    setCurrentStatus("");
    setPage(1);
  }

  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setPage(nextPage);
  }

  function handleSort(column: SortBy) {
    if (sortBy === column) {
      setSortOrder((currentOrder) =>
        currentOrder === "asc" ? "desc" : "asc",
      );
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }

    setPage(1);
  }

  function getSortIndicator(column: SortBy) {
    if (sortBy !== column) {
      return "";
    }

    return sortOrder === "asc" ? " ↑" : " ↓";
  }

  function getPriorityBadgeClass(
    priority: TicketListItem["requestedPriority"],
  ) {
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

  function getPriorityLabel(
    priority: TicketListItem["requestedPriority"],
  ) {
    switch (priority) {
      case "LOW":
        return "Low";

      case "MEDIUM":
        return "Medium";

      case "HIGH":
        return "High";

      default:
        return priority;
    }
  }

  function getStatusBadgeClass(
    status: TicketListItem["currentStatus"],
  ) {
    switch (status) {
      case "NEW":
        return "status-new";

      default:
        return "status-new";
    }
  }

  function getStatusLabel(
    status: TicketListItem["currentStatus"],
  ) {
    switch (status) {
      case "NEW":
        return "New";

      default:
        return status;
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  const firstItem =
    totalItems === 0 ? 0 : (page - 1) * pageSize + 1;

  const lastItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="min-vh-100">
      <header className="app-header text-white">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-bold fs-5">TokTickIT</div>
              <div className="small">IT Service Desk</div>
            </div>

            <div className="small">
              Requester: <strong>Jennifer Anderson</strong>
            </div>
          </div>
        </div>
      </header>

      <main className="container app-main">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="page-title mb-1">My Tickets</h1>

            <p className="page-subtitle mb-0">
              View and manage tickets created by you.
            </p>
          </div>

          <button
            className="btn btn-success"
            type="button"
          >
            + Create Ticket
          </button>
        </div>

        <section className="zen-card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-lg-5">
                <label
                  htmlFor="ticket-search"
                  className="form-label"
                >
                  Search
                </label>

                <input
                  id="ticket-search"
                  type="search"
                  className="form-control"
                  placeholder="Search by ticket number or summary..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="col-12 col-md-4 col-lg-2">
                <label
                  htmlFor="category-filter"
                  className="form-label"
                >
                  Category
                </label>

                <select
                  id="category-filter"
                  className="form-select"
                  value={categoryId}
                  onChange={(event) => {
                    setCategoryId(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All</option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-4 col-lg-2">
                <label
                  htmlFor="priority-filter"
                  className="form-label"
                >
                  Requested Priority
                </label>

                <select
                  id="priority-filter"
                  className="form-select"
                  value={requestedPriority}
                  onChange={(event) => {
                    setRequestedPriority(
                      event.target.value as Priority,
                    );
                    setPage(1);
                  }}
                >
                  <option value="">All</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="col-12 col-md-4 col-lg-2">
                <label
                  htmlFor="status-filter"
                  className="form-label"
                >
                  Current Status
                </label>

                <select
                  id="status-filter"
                  className="form-select"
                  value={currentStatus}
                  onChange={(event) => {
                    setCurrentStatus(
                      event.target.value as Status,
                    );
                    setPage(1);
                  }}
                >
                  <option value="">All</option>
                  <option value="NEW">New</option>
                </select>
              </div>

              <div className="col-12 col-lg-1 d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-outline-success w-100"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </section>

        {errorMessage ? (
          <div
            className="zen-error rounded p-3 mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3"
            role="alert"
          >
            <span>{errorMessage}</span>

            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => void loadTickets()}
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <section className="zen-card shadow-sm">
            <div className="card-body p-4 text-center text-muted">
              Loading...
            </div>
          </section>
        ) : totalItems === 0 ? (
          <section className="zen-card shadow-sm">
            <div className="empty-state">
              {hasActiveFilters ? (
                <>
                  <h2 className="h5">
                    No tickets match your search or filters.
                  </h2>

                  <p className="mb-3">
                    Try changing your search or filter criteria.
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
                  <h2 className="h5">No tickets yet</h2>

                  <p className="mb-3">
                    You have not created any tickets yet.
                  </p>

                  <button
                    type="button"
                    className="btn btn-success"
                  >
                    Create your first ticket
                  </button>
                </>
              )}
            </div>
          </section>
        ) : (
          <>
            {/* Desktop: 992px and above */}
            <section className="zen-card shadow-sm d-none d-lg-block">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table ticket-table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th scope="col">
                          <button
                            type="button"
                            className="btn btn-link sort-button p-0"
                            onClick={() =>
                              handleSort("ticketNumber")
                            }
                          >
                            Ticket No.
                            {getSortIndicator("ticketNumber")}
                          </button>
                        </th>

                        <th scope="col">
                          <button
                            type="button"
                            className="btn btn-link sort-button p-0"
                            onClick={() =>
                              handleSort("createdAt")
                            }
                          >
                            Created Date
                            {getSortIndicator("createdAt")}
                          </button>
                        </th>

                        <th scope="col">
                          <button
                            type="button"
                            className="btn btn-link sort-button p-0"
                            onClick={() =>
                              handleSort("summary")
                            }
                          >
                            Summary
                            {getSortIndicator("summary")}
                          </button>
                        </th>

                        <th scope="col">
                          Category
                        </th>

                        <th scope="col">
                          Requested Priority
                        </th>

                        <th scope="col">
                          Current Status
                        </th>

                        <th scope="col">
                          <button
                            type="button"
                            className="btn btn-link sort-button p-0"
                            onClick={() =>
                              handleSort("updatedAt")
                            }
                          >
                            Last Updated
                            {getSortIndicator("updatedAt")}
                          </button>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>
                            <strong>
                              {ticket.ticketNumber}
                            </strong>
                          </td>

                          <td>
                            {formatDate(ticket.createdAt)}
                          </td>

                          <td>{ticket.summary}</td>

                          <td>{ticket.categoryName}</td>

                          <td>
                            <span
                              className={`badge rounded-pill ${getPriorityBadgeClass(
                                ticket.requestedPriority,
                              )}`}
                            >
                              {getPriorityLabel(
                                ticket.requestedPriority,
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`badge rounded-pill ${getStatusBadgeClass(
                                ticket.currentStatus,
                              )}`}
                            >
                              {getStatusLabel(
                                ticket.currentStatus,
                              )}
                            </span>
                          </td>

                          <td>
                            {formatDate(ticket.updatedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Tablet: 768px to 991px */}
            <section className="zen-card shadow-sm d-none d-md-block d-lg-none">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table ticket-table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th scope="col">
                          Ticket No.
                        </th>

                        <th scope="col">
                          Summary
                        </th>

                        <th scope="col">
                          Current Status
                        </th>

                        <th scope="col">
                          Last Updated
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>
                            <strong>
                              {ticket.ticketNumber}
                            </strong>
                          </td>

                          <td>{ticket.summary}</td>

                          <td>
                            <span
                              className={`badge rounded-pill ${getStatusBadgeClass(
                                ticket.currentStatus,
                              )}`}
                            >
                              {getStatusLabel(
                                ticket.currentStatus,
                              )}
                            </span>
                          </td>

                          <td>
                            {formatDate(ticket.updatedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Mobile: below 768px */}
            <section className="d-md-none">
              <div className="d-flex flex-column gap-3">
                {tickets.map((ticket) => (
                  <article
                    key={ticket.id}
                    className="zen-card shadow-sm"
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                        <div>
                          <div className="small text-muted mb-1">
                            Ticket No.
                          </div>

                          <strong>
                            {ticket.ticketNumber}
                          </strong>
                        </div>

                        <span
                          className={`badge rounded-pill ${getStatusBadgeClass(
                            ticket.currentStatus,
                          )}`}
                        >
                          {getStatusLabel(
                            ticket.currentStatus,
                          )}
                        </span>
                      </div>

                      <div className="mb-3">
                        <div className="small text-muted mb-1">
                          Summary
                        </div>

                        <div className="fw-medium">
                          {ticket.summary}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="small text-muted mb-1">
                          Category
                        </div>

                        <span className="badge rounded-pill priority-low">
                          {ticket.categoryName}
                        </span>
                      </div>

                      <div className="mb-3">
                        <div className="small text-muted mb-1">
                          Requested Priority
                        </div>

                        <span
                          className={`badge rounded-pill ${getPriorityBadgeClass(
                            ticket.requestedPriority,
                          )}`}
                        >
                          {getPriorityLabel(
                            ticket.requestedPriority,
                          )}
                        </span>
                      </div>

                      <div className="small text-muted">
                        Last Updated:{" "}
                        {formatDate(ticket.updatedAt)}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
              <div className="text-muted small text-center text-md-start">
                Showing {firstItem} to {lastItem} of{" "}
                {totalItems} tickets
              </div>

              {totalPages > 1 && (
                <nav aria-label="Ticket pagination">
                  <ul className="pagination mb-0 flex-wrap justify-content-center">
                    <li
                      className={`page-item ${
                        page === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1}
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
                          pageNumber === page ? "active" : ""
                        }`}
                      >
                        <button
                          type="button"
                          className="page-link"
                          onClick={() =>
                            goToPage(pageNumber)
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
                        page === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() =>
                          goToPage(page + 1)
                        }
                        disabled={page === totalPages}
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
      </main>
    </div>
  );
}