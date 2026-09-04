import { useEffect, useState, type FormEvent } from "react";
import {
  createTicket,
  getCategories,
  getRelatedSystems,
  getRequesters,
  getTickets,
  getTicketDetail,
  uploadAttachment,
  downloadAttachment,
  removeAttachment,
  type Category,
  type RelatedSystem,
  type Requester,
  type TicketListItem,
  type TicketListParams,
  type RequestedPriority,
} from "./api.js";

type Priority = "" | RequestedPriority;
type Status = "" | "NEW";
type Screen = "my-tickets" | "create-ticket" | "ticket-detail";

interface TicketDetail {
  id: number;
  ticketNumber: string;
  requesterId: number;
  categoryId: number;
  relatedSystemId: number;
  categoryName?: string;
  relatedSystemName?: string;
  summary: string;
  description: string;
  requestedPriority: RequestedPriority;
  currentStatus: "NEW";
  createdAt: string;
  updatedAt: string;
  attachments?: TicketAttachment[];
}

interface TicketAttachment {
  id: number;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  isRemoved: boolean;
  removedAt?: string | null;
  removalReason?: string | null;
}

type SortBy = NonNullable<TicketListParams["sortBy"]>;
type SortOrder = NonNullable<TicketListParams["sortOrder"]>;

interface CreateForm {
  categoryId: string;
  relatedSystemId: string;
  summary: string;
  description: string;
  requestedPriority: Priority;
}

interface CreateFormErrors {
  categoryId?: string;
  relatedSystemId?: string;
  summary?: string;
  description?: string;
  requestedPriority?: string;
}

export default function App() {
  /*
   * Lab 2 temporary requester selector.
   * Authentication is intentionally excluded from this lab.
   */
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [requesterId, setRequesterId] = useState<number | null>(null);
  const [requesterLoading, setRequesterLoading] = useState(true);
  const [requesterError, setRequesterError] = useState("");

  const [screen, setScreen] = useState<Screen>("my-tickets");

  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [selectedTicket, setSelectedTicket] =
    useState<TicketDetail | null>(null);
  const [selectedTicketId, setSelectedTicketId] =
    useState<number | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState("");
  const [removingAttachmentId, setRemovingAttachmentId] =
    useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [relatedSystems, setRelatedSystems] =
    useState<RelatedSystem[]>([]);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [requestedPriority, setRequestedPriority] =
    useState<Priority>("");
  const [currentStatus, setCurrentStatus] = useState<Status>("");

  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [createForm, setCreateForm] = useState<CreateForm>({
    categoryId: "",
    relatedSystemId: "",
    summary: "",
    description: "",
    requestedPriority: "",
  });

  const [createErrors, setCreateErrors] =
    useState<CreateFormErrors>({});
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createdTicketNumber, setCreatedTicketNumber] =
    useState("");

  const selectedRequester =
    requesterId === null
      ? null
      : requesters.find((requester) => requester.id === requesterId) ??
        null;

  const requesterName =
    selectedRequester?.name ?? "No requester selected";

  const hasActiveFilters =
    search.trim() !== "" ||
    categoryId !== "" ||
    requestedPriority !== "" ||
    currentStatus !== "";

  /*
   * Load the temporary Lab 2 requester selector.
   * Only active requesters are available for selection.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadRequesters() {
      setRequesterLoading(true);
      setRequesterError("");

      try {
        const response = await getRequesters();

        if (cancelled) {
          return;
        }

        const activeRequesters = response.filter(
          (requester) => requester.isActive,
        );

        setRequesters(activeRequesters);

        /*
         * Keep the current requester if it is still active.
         * Otherwise select the first active requester for the
         * temporary Lab 2 testing flow.
         */
        setRequesterId((currentRequesterId) => {
          if (
            currentRequesterId !== null &&
            activeRequesters.some(
              (requester) => requester.id === currentRequesterId,
            )
          ) {
            return currentRequesterId;
          }

          return activeRequesters[0]?.id ?? null;
        });
      } catch (err) {
        if (cancelled) {
          return;
        }

        setRequesters([]);
        setRequesterId(null);
        setRequesterError(
          err instanceof Error
            ? err.message
            : "Unable to retrieve requesters.",
        );
      } finally {
        if (!cancelled) {
          setRequesterLoading(false);
        }
      }
    }

    void loadRequesters();

    return () => {
      cancelled = true;
    };
  }, []);

  async function loadTickets() {
    if (requesterId === null) {
      setTickets([]);
      setTotalItems(0);
      setTotalPages(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await getTickets({
        requesterId,
        search,
        categoryId: categoryId
          ? Number(categoryId)
          : undefined,
        requestedPriority:
          requestedPriority || undefined,
        currentStatus: currentStatus || undefined,
        sortBy,
        sortOrder,
        page,
        pageSize,
      });

      setTickets(response.data);
      setTotalItems(response.pagination.total);
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

  async function loadCategories() {
    try {
      const response = await getCategories();
      setCategories(response);
    } catch {
      setCategories([]);
    }
  }

  async function loadRelatedSystems() {
    try {
      const response = await getRelatedSystems();
      setRelatedSystems(response);
    } catch {
      setRelatedSystems([]);
    }
  }

  useEffect(() => {
    void loadCategories();
    void loadRelatedSystems();
  }, []);

  /*
   * Reload My Tickets whenever the selected requester or any
   * list control changes.
   */
  useEffect(() => {
    if (screen === "my-tickets" && requesterId !== null) {
      void loadTickets();
    }
  }, [
    screen,
    requesterId,
    search,
    categoryId,
    requestedPriority,
    currentStatus,
    sortBy,
    sortOrder,
    page,
  ]);

  /*
   * Changing requester invalidates old ticket/detail data.
   * This prevents data from the previous requester remaining
   * visible while the new requester's data is loading.
   */
  useEffect(() => {
    setTickets([]);
    setTotalItems(0);
    setTotalPages(0);
    setPage(1);

    setSelectedTicket(null);
    setSelectedTicketId(null);
    setDetailError("");
    setAttachmentError("");
    setSelectedFile(null);

    setErrorMessage("");
  }, [requesterId]);

  async function openTicketDetail(ticketId: number) {
    if (requesterId === null) {
      return;
    }

    setDetailLoading(true);
    setDetailError("");
    setSelectedTicket(null);
    setSelectedTicketId(ticketId);
    setAttachmentError("");
    setSelectedFile(null);
    setScreen("ticket-detail");

    try {
      const ticket = await getTicketDetail(
        requesterId,
        ticketId,
      );
      setSelectedTicket(ticket);
    } catch (err) {
      setDetailError(
        err instanceof Error
          ? err.message
          : "Unable to retrieve ticket details.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function handleRequesterChange(nextRequesterId: string) {
    const parsedId = Number(nextRequesterId);

    if (!nextRequesterId || Number.isNaN(parsedId)) {
      setRequesterId(null);
      return;
    }

    if (
      !requesters.some(
        (requester) => requester.id === parsedId,
      )
    ) {
      return;
    }

    setRequesterId(parsedId);
    setScreen("my-tickets");
    setSearch("");
    setCategoryId("");
    setRequestedPriority("");
    setCurrentStatus("");
    setPage(1);
    setSortBy("createdAt");
    setSortOrder("desc");
  }

  function backToMyTickets() {
    setSelectedTicket(null);
    setSelectedTicketId(null);
    setDetailError("");
    setAttachmentError("");
    setSelectedFile(null);
    setScreen("my-tickets");
  }

  function formatFileSize(sizeBytes: number) {
    if (sizeBytes < 1024) {
      return `${sizeBytes} B`;
    }

    if (sizeBytes < 1024 * 1024) {
      return `${(sizeBytes / 1024).toFixed(1)} KB`;
    }

    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function refreshTicketDetail() {
    if (
      selectedTicketId === null ||
      requesterId === null
    ) {
      return;
    }

    setDetailLoading(true);
    setDetailError("");

    try {
      const ticket = await getTicketDetail(
        requesterId,
        selectedTicketId,
      );
      setSelectedTicket(ticket);
    } catch (err) {
      setDetailError(
        err instanceof Error
          ? err.message
          : "Unable to retrieve ticket details.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleAttachmentUpload() {
    if (
      selectedTicketId === null ||
      !selectedFile ||
      requesterId === null
    ) {
      return;
    }

    setUploadingAttachment(true);
    setAttachmentError("");

    try {
      await uploadAttachment(
        requesterId,
        selectedTicketId,
        selectedFile,
      );

      setSelectedFile(null);

      const fileInput = document.getElementById(
        "attachment-file",
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      await refreshTicketDetail();
    } catch (err) {
      setAttachmentError(
        err instanceof Error
          ? err.message
          : "Unable to upload attachment.",
      );
    } finally {
      setUploadingAttachment(false);
    }
  }

  async function handleAttachmentOpen(
    attachment: TicketAttachment,
  ) {
    if (
      selectedTicketId === null ||
      requesterId === null ||
      attachment.isRemoved
    ) {
      return;
    }

    setAttachmentError("");

    try {
      const blob = await downloadAttachment(
        requesterId,
        attachment.id,
      );

      const objectUrl = URL.createObjectURL(blob);

      const openedWindow = window.open(
        objectUrl,
        "_blank",
        "noopener,noreferrer",
      );

      if (!openedWindow) {
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = attachment.originalFilename;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      window.setTimeout(
        () => URL.revokeObjectURL(objectUrl),
        60_000,
      );
    } catch (err) {
      setAttachmentError(
        err instanceof Error
          ? err.message
          : "Unable to open attachment.",
      );
    }
  }

  async function handleAttachmentRemove(
    attachment: TicketAttachment,
  ) {
    if (
      selectedTicketId === null ||
      requesterId === null ||
      attachment.isRemoved
    ) {
      return;
    }

    const reason = window.prompt(
      `Enter a removal reason for "${attachment.originalFilename}" (at least 5 characters):`,
    );

    if (reason === null) {
      return;
    }

    if (reason.trim().length < 5) {
      setAttachmentError(
        "Removal reason must be at least 5 characters.",
      );
      return;
    }

    setRemovingAttachmentId(attachment.id);
    setAttachmentError("");

    try {
      await removeAttachment(
        requesterId,
        attachment.id,
        reason.trim(),
      );

      await refreshTicketDetail();
    } catch (err) {
      setAttachmentError(
        err instanceof Error
          ? err.message
          : "Unable to remove attachment.",
      );
    } finally {
      setRemovingAttachmentId(null);
    }
  }

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

  function openCreateTicket() {
    if (requesterId === null) {
      return;
    }

    setCreateForm({
      categoryId: "",
      relatedSystemId: "",
      summary: "",
      description: "",
      requestedPriority: "",
    });

    setCreateErrors({});
    setCreateError("");
    setCreatedTicketNumber("");
    setScreen("create-ticket");
  }

  function openMyTickets() {
    setCreateError("");
    setCreatedTicketNumber("");
    setScreen("my-tickets");
  }

  function updateCreateForm(
    field: keyof CreateForm,
    value: string,
  ) {
    setCreateForm((current) => ({
      ...current,
      [field]: value,
    }));

    setCreateErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setCreateError("");
  }

  function validateCreateForm(): CreateFormErrors {
    const errors: CreateFormErrors = {};

    const summary = createForm.summary.trim();
    const description = createForm.description.trim();

    if (!createForm.categoryId) {
      errors.categoryId = "Please select a category.";
    }

    if (!createForm.relatedSystemId) {
      errors.relatedSystemId =
        "Please select a related system.";
    }

    if (!summary) {
      errors.summary = "Summary is required.";
    } else if (summary.length < 5) {
      errors.summary =
        "Summary must be at least 5 characters.";
    } else if (summary.length > 150) {
      errors.summary =
        "Summary must not exceed 150 characters.";
    }

    if (!description) {
      errors.description = "Description is required.";
    } else if (description.length < 10) {
      errors.description =
        "Description must be at least 10 characters.";
    } else if (description.length > 2000) {
      errors.description =
        "Description must not exceed 2,000 characters.";
    }

    if (!createForm.requestedPriority) {
      errors.requestedPriority =
        "Please select a requested priority.";
    }

    return errors;
  }

  async function handleCreateTicket(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (requesterId === null) {
      setCreateError(
        "Please select an active requester before creating a ticket.",
      );
      return;
    }

    const errors = validateCreateForm();

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    setCreateSubmitting(true);
    setCreateError("");
    setCreateErrors({});

    try {
      const ticket = await createTicket(requesterId, {
        categoryId: Number(createForm.categoryId),
        relatedSystemId: Number(
          createForm.relatedSystemId,
        ),
        summary: createForm.summary.trim(),
        description: createForm.description.trim(),
        requestedPriority:
          createForm.requestedPriority as RequestedPriority,
      });

      setCreatedTicketNumber(ticket.ticketNumber);
    } catch (err) {
      setCreateError(
        err instanceof Error
          ? err.message
          : "Unable to create ticket.",
      );
    } finally {
      setCreateSubmitting(false);
    }
  }

  function createAnotherTicket() {
    setCreateForm({
      categoryId: "",
      relatedSystemId: "",
      summary: "",
      description: "",
      requestedPriority: "",
    });

    setCreateErrors({});
    setCreateError("");
    setCreatedTicketNumber("");
  }

  const firstItem =
    totalItems === 0 ? 0 : (page - 1) * pageSize + 1;

  const lastItem = Math.min(
    page * pageSize,
    totalItems,
  );

  return (
    <div className="min-vh-100">
      <header className="app-header text-white">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center gap-3">
            <div>
              <div className="fw-bold fs-5">
                TokTickIT
              </div>
              <div className="small">
                IT Service Desk
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <nav className="d-none d-md-flex gap-2">
                <button
                  type="button"
                  className={`header-nav-button ${
                    screen === "my-tickets" ||
                    screen === "ticket-detail"
                      ? "active"
                      : ""
                  }`}
                  onClick={openMyTickets}
                >
                  My Tickets
                </button>

                <button
                  type="button"
                  className={`header-nav-button ${
                    screen === "create-ticket"
                      ? "active"
                      : ""
                  }`}
                  onClick={openCreateTicket}
                  disabled={
                    requesterLoading ||
                    requesterId === null
                  }
                >
                  Create Ticket
                </button>
              </nav>

              <div className="small text-end">
                <label
                  htmlFor="requester-selector"
                  className="form-label mb-1 text-white"
                >
                  Requester
                </label>

                <select
                  id="requester-selector"
                  className="form-select form-select-sm"
                  value={
                    requesterId === null
                      ? ""
                      : String(requesterId)
                  }
                  onChange={(event) =>
                    handleRequesterChange(
                      event.target.value,
                    )
                  }
                  disabled={requesterLoading}
                  aria-label="Select requester"
                >
                  <option value="">
                    Select requester
                  </option>

                  {requesters.map((requester) => (
                    <option
                      key={requester.id}
                      value={requester.id}
                    >
                      {requester.name}
                    </option>
                  ))}
                </select>

                <div className="opacity-75 mt-1">
                  Lab 2 testing requester
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container app-main">
        {requesterLoading ? (
          <section className="zen-card shadow-sm">
            <div className="card-body p-4 text-center text-muted">
              Loading requesters...
            </div>
          </section>
        ) : requesterError ? (
          <section
            className="zen-alert-error rounded p-4"
            role="alert"
          >
            <div className="fw-semibold mb-1">
              Unable to load requesters
            </div>
            <div>{requesterError}</div>
          </section>
        ) : requesters.length === 0 ? (
          <section className="zen-card shadow-sm">
            <div className="empty-state">
              <h1 className="h5">
                No active requesters available
              </h1>

              <p className="mb-0">
                There are currently no active requesters
                available for Lab 2 testing.
              </p>
            </div>
          </section>
        ) : requesterId === null ? (
          <section className="zen-card shadow-sm">
            <div className="empty-state">
              <h1 className="h5">
                Select a requester
              </h1>

              <p className="mb-0">
                Please select an active requester to view
                My Tickets or create a ticket.
              </p>
            </div>
          </section>
        ) : screen === "ticket-detail" ? (
          <section>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <div>
                <button
                  type="button"
                  className="btn btn-link p-0 mb-2 text-decoration-none"
                  onClick={backToMyTickets}
                >
                  ← Back to My Tickets
                </button>

                <h1 className="page-title mb-1">
                  Ticket Detail
                </h1>

                <p className="page-subtitle mb-0">
                  View your submitted ticket and attachment
                  information.
                </p>
              </div>
            </div>

            {detailError ? (
              <div
                className="zen-alert-error rounded p-3 mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3"
                role="alert"
              >
                <span>{detailError}</span>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => {
                    if (selectedTicketId !== null) {
                      void openTicketDetail(
                        selectedTicketId,
                      );
                    }
                  }}
                >
                  Retry
                </button>
              </div>
            ) : detailLoading ? (
              <section className="zen-card shadow-sm">
                <div className="card-body p-4 text-center text-muted">
                  Loading...
                </div>
              </section>
            ) : selectedTicket ? (
              <>
                <section className="zen-card shadow-sm mb-4">
                  <div className="card-body p-4">
                    <div className="d-flex flex-column flex-sm-row justify-content-between gap-3 mb-4">
                      <div>
                        <div className="small text-muted mb-1">
                          Ticket Number
                        </div>

                        <div className="h4 mb-0">
                          {selectedTicket.ticketNumber}
                        </div>
                      </div>

                      <span
                        className={`badge rounded-pill align-self-start ${getStatusBadgeClass(
                          selectedTicket.currentStatus,
                        )}`}
                      >
                        {getStatusLabel(
                          selectedTicket.currentStatus,
                        )}
                      </span>
                    </div>

                    <div className="row g-4">
                      <div className="col-12 col-md-6">
                        <div className="small text-muted mb-1">
                          Category
                        </div>

                        <div>
                          {selectedTicket.categoryName ??
                            categories.find(
                              (category) =>
                                category.id ===
                                selectedTicket.categoryId,
                            )?.name ??
                            "—"}
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="small text-muted mb-1">
                          Related System
                        </div>

                        <div>
                          {selectedTicket.relatedSystemName ??
                            relatedSystems.find(
                              (system) =>
                                system.id ===
                                selectedTicket.relatedSystemId,
                            )?.name ??
                            "—"}
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="small text-muted mb-1">
                          Requested Priority
                        </div>

                        <span
                          className={`badge rounded-pill ${getPriorityBadgeClass(
                            selectedTicket.requestedPriority,
                          )}`}
                        >
                          {getPriorityLabel(
                            selectedTicket.requestedPriority,
                          )}
                        </span>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="small text-muted mb-1">
                          Created
                        </div>

                        <div>
                          {formatDate(
                            selectedTicket.createdAt,
                          )}
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="small text-muted mb-1">
                          Last Updated
                        </div>

                        <div>
                          {formatDate(
                            selectedTicket.updatedAt,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="zen-card shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h2 className="section-title mb-3">
                      Request Details
                    </h2>

                    <div className="mb-4">
                      <div className="small text-muted mb-1">
                        Summary
                      </div>

                      <div className="fw-semibold">
                        {selectedTicket.summary}
                      </div>
                    </div>

                    <div>
                      <div className="small text-muted mb-1">
                        Description
                      </div>

                      <div className="ticket-description">
                        {selectedTicket.description}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="zen-card shadow-sm mb-5">
                  <div className="card-body p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
                      <div>
                        <h2 className="section-title mb-1">
                          Attachments
                        </h2>

                        <div className="form-helper">
                          JPG, JPEG, PNG, WEBP, or PDF ·
                          maximum 5 MB per file · maximum 5
                          active files.
                        </div>
                      </div>
                    </div>

                    {attachmentError && (
                      <div
                        className="zen-alert-error rounded p-3 mb-3"
                        role="alert"
                      >
                        {attachmentError}
                      </div>
                    )}

                    <div className="border rounded p-3 mb-4">
                      <label
                        htmlFor="attachment-file"
                        className="form-label"
                      >
                        Add attachment
                      </label>

                      <input
                        id="attachment-file"
                        type="file"
                        className="form-control mb-2"
                        accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                        disabled={
                          uploadingAttachment ||
                          removingAttachmentId !== null
                        }
                        onChange={(event) => {
                          setSelectedFile(
                            event.target.files?.[0] ??
                              null,
                          );
                          setAttachmentError("");
                        }}
                      />

                      {selectedFile && (
                        <div className="small text-muted mb-2">
                          Selected:{" "}
                          <strong>
                            {selectedFile.name}
                          </strong>{" "}
                          (
                          {formatFileSize(
                            selectedFile.size,
                          )}
                          )
                        </div>
                      )}

                      <button
                        type="button"
                        className="btn btn-success"
                        disabled={
                          !selectedFile ||
                          uploadingAttachment ||
                          removingAttachmentId !== null
                        }
                        onClick={() =>
                          void handleAttachmentUpload()
                        }
                      >
                        {uploadingAttachment ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              aria-hidden="true"
                            />
                            Uploading...
                          </>
                        ) : (
                          "Upload Attachment"
                        )}
                      </button>
                    </div>

                    {selectedTicket.attachments &&
                    selectedTicket.attachments.length > 0 ? (
                      <div className="d-flex flex-column gap-2">
                        {selectedTicket.attachments.map(
                          (attachment) => (
                            <div
                              key={attachment.id}
                              className={`border rounded p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 ${
                                attachment.isRemoved
                                  ? "bg-light text-muted"
                                  : ""
                              }`}
                            >
                              <div className="min-w-0">
                                <div
                                  className="fw-medium text-truncate"
                                  title={
                                    attachment.originalFilename
                                  }
                                >
                                  {
                                    attachment.originalFilename
                                  }
                                </div>

                                <div className="small text-muted">
                                  {formatFileSize(
                                    attachment.sizeBytes,
                                  )}{" "}
                                  ·{" "}
                                  {formatDate(
                                    attachment.uploadedAt,
                                  )}
                                </div>

                                {attachment.isRemoved &&
                                  attachment.removalReason && (
                                    <div className="small mt-1">
                                      Removed:{" "}
                                      {
                                        attachment.removalReason
                                      }
                                    </div>
                                  )}
                              </div>

                              {attachment.isRemoved ? (
                                <span className="badge rounded-pill status-new align-self-start">
                                  Removed
                                </span>
                              ) : (
                                <div className="d-flex flex-wrap gap-2 align-items-center">
                                  <span className="badge rounded-pill status-new">
                                    Available
                                  </span>

                                  <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() =>
                                      void handleAttachmentOpen(
                                        attachment,
                                      )
                                    }
                                    disabled={
                                      uploadingAttachment ||
                                      removingAttachmentId !==
                                        null
                                    }
                                  >
                                    Download / Preview
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() =>
                                      void handleAttachmentRemove(
                                        attachment,
                                      )
                                    }
                                    disabled={
                                      uploadingAttachment ||
                                      removingAttachmentId !==
                                        null
                                    }
                                  >
                                    {removingAttachmentId ===
                                    attachment.id
                                      ? "Removing..."
                                      : "Remove"}
                                  </button>
                                </div>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="text-muted">
                        No attachments have been added to this
                        ticket.
                      </div>
                    )}
                  </div>
                </section>
              </>
            ) : null}
          </section>
        ) : screen === "create-ticket" ? (
          <section>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <div>
                <h1 className="page-title mb-1">
                  Create Ticket
                </h1>

                <p className="page-subtitle mb-0">
                  Submit a request to the IT Service Desk.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-outline-success"
                onClick={openMyTickets}
                disabled={createSubmitting}
              >
                ← My Tickets
              </button>
            </div>

            {createdTicketNumber ? (
              <section className="zen-card shadow-sm">
                <div className="card-body p-4">
                  <div className="zen-alert-success rounded p-4">
                    <div className="success-icon mb-2">
                      ✓
                    </div>

                    <h2 className="h5 mb-2">
                      Ticket created successfully
                    </h2>

                    <p className="mb-2">
                      Your ticket has been submitted
                      successfully.
                    </p>

                    <div className="ticket-number-success mb-4">
                      <span className="small text-muted d-block">
                        Ticket Number
                      </span>

                      <strong>
                        {createdTicketNumber}
                      </strong>
                    </div>

                    <div className="d-flex flex-column flex-sm-row gap-2">
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={openMyTickets}
                      >
                        View My Tickets
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-success"
                        onClick={createAnotherTicket}
                      >
                        Create Another Ticket
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <form onSubmit={handleCreateTicket}>
                <section className="zen-card shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h2 className="section-title mb-3">
                      Ticket Information
                    </h2>

                    <div className="readonly-ticket-number mb-4">
                      <label className="form-label">
                        Ticket Number
                      </label>

                      <div
                        className="readonly-field"
                        aria-readonly="true"
                      >
                        Generated automatically after
                        submission
                      </div>

                      <div className="form-helper">
                        The official Ticket Number is
                        generated by the backend.
                      </div>
                    </div>

                    <div className="row g-4">
                      <div className="col-12 col-md-6">
                        <label
                          htmlFor="create-category"
                          className="form-label"
                        >
                          Category{" "}
                          <span className="required-mark">
                            *
                          </span>
                        </label>

                        <select
                          id="create-category"
                          className={`form-select ${
                            createErrors.categoryId
                              ? "is-invalid"
                              : ""
                          }`}
                          value={createForm.categoryId}
                          onChange={(event) =>
                            updateCreateForm(
                              "categoryId",
                              event.target.value,
                            )
                          }
                          disabled={createSubmitting}
                          aria-invalid={
                            createErrors.categoryId
                              ? "true"
                              : "false"
                          }
                        >
                          <option value="">
                            Select a category
                          </option>

                          {categories.map((category) => (
                            <option
                              key={category.id}
                              value={category.id}
                            >
                              {category.name}
                            </option>
                          ))}
                        </select>

                        {createErrors.categoryId && (
                          <div
                            className="field-error"
                            role="alert"
                          >
                            ⚠ {createErrors.categoryId}
                          </div>
                        )}
                      </div>

                      <div className="col-12 col-md-6">
                        <label
                          htmlFor="create-related-system"
                          className="form-label"
                        >
                          Related System{" "}
                          <span className="required-mark">
                            *
                          </span>
                        </label>

                        <select
                          id="create-related-system"
                          className={`form-select ${
                            createErrors.relatedSystemId
                              ? "is-invalid"
                              : ""
                          }`}
                          value={
                            createForm.relatedSystemId
                          }
                          onChange={(event) =>
                            updateCreateForm(
                              "relatedSystemId",
                              event.target.value,
                            )
                          }
                          disabled={createSubmitting}
                          aria-invalid={
                            createErrors.relatedSystemId
                              ? "true"
                              : "false"
                          }
                        >
                          <option value="">
                            Select a related system
                          </option>

                          {relatedSystems.map((system) => (
                            <option
                              key={system.id}
                              value={system.id}
                            >
                              {system.name}
                            </option>
                          ))}
                        </select>

                        {createErrors.relatedSystemId && (
                          <div
                            className="field-error"
                            role="alert"
                          >
                            ⚠{" "}
                            {
                              createErrors.relatedSystemId
                            }
                          </div>
                        )}
                      </div>

                      <div className="col-12">
                        <label
                          htmlFor="create-priority"
                          className="form-label"
                        >
                          Requested Priority{" "}
                          <span className="required-mark">
                            *
                          </span>
                        </label>

                        <select
                          id="create-priority"
                          className={`form-select ${
                            createErrors.requestedPriority
                              ? "is-invalid"
                              : ""
                          }`}
                          value={
                            createForm.requestedPriority
                          }
                          onChange={(event) =>
                            updateCreateForm(
                              "requestedPriority",
                              event.target.value,
                            )
                          }
                          disabled={createSubmitting}
                          aria-invalid={
                            createErrors.requestedPriority
                              ? "true"
                              : "false"
                          }
                        >
                          <option value="">
                            Select requested priority
                          </option>

                          <option value="LOW">
                            Low
                          </option>

                          <option value="MEDIUM">
                            Medium
                          </option>

                          <option value="HIGH">
                            High
                          </option>
                        </select>

                        {createErrors.requestedPriority && (
                          <div
                            className="field-error"
                            role="alert"
                          >
                            ⚠{" "}
                            {
                              createErrors.requestedPriority
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="zen-card shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h2 className="section-title mb-3">
                      Request Details
                    </h2>

                    <div className="mb-4">
                      <label
                        htmlFor="create-summary"
                        className="form-label"
                      >
                        Summary{" "}
                        <span className="required-mark">
                          *
                        </span>
                      </label>

                      <input
                        id="create-summary"
                        type="text"
                        className={`form-control ${
                          createErrors.summary
                            ? "is-invalid"
                            : ""
                        }`}
                        value={createForm.summary}
                        onChange={(event) =>
                          updateCreateForm(
                            "summary",
                            event.target.value,
                          )
                        }
                        maxLength={150}
                        disabled={createSubmitting}
                        placeholder="Briefly describe your issue"
                        aria-describedby="summary-helper"
                        aria-invalid={
                          createErrors.summary
                            ? "true"
                            : "false"
                        }
                      />

                      {createErrors.summary ? (
                        <div
                          className="field-error"
                          role="alert"
                        >
                          ⚠ {createErrors.summary}
                        </div>
                      ) : (
                        <div
                          id="summary-helper"
                          className="form-helper"
                        >
                          5–150 characters.
                        </div>
                      )}

                      <div className="character-count">
                        {createForm.summary.length}/150
                      </div>
                    </div>

                    <div className="mb-2">
                      <label
                        htmlFor="create-description"
                        className="form-label"
                      >
                        Description{" "}
                        <span className="required-mark">
                          *
                        </span>
                      </label>

                      <textarea
                        id="create-description"
                        className={`form-control ${
                          createErrors.description
                            ? "is-invalid"
                            : ""
                        }`}
                        value={createForm.description}
                        onChange={(event) =>
                          updateCreateForm(
                            "description",
                            event.target.value,
                          )
                        }
                        maxLength={2000}
                        rows={6}
                        disabled={createSubmitting}
                        placeholder="Describe the issue, what happened, and any useful details..."
                        aria-describedby="description-helper"
                        aria-invalid={
                          createErrors.description
                            ? "true"
                            : "false"
                        }
                      />

                      {createErrors.description ? (
                        <div
                          className="field-error"
                          role="alert"
                        >
                          ⚠ {createErrors.description}
                        </div>
                      ) : (
                        <div
                          id="description-helper"
                          className="form-helper"
                        >
                          10–2,000 characters.
                        </div>
                      )}

                      <div className="character-count">
                        {createForm.description.length}/2000
                      </div>
                    </div>
                  </div>
                </section>

                {createError && (
                  <div
                    className="zen-alert-error rounded p-3 mb-4"
                    role="alert"
                  >
                    <div className="fw-semibold mb-1">
                      Unable to create ticket
                    </div>

                    <div>{createError}</div>
                  </div>
                )}

                <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 mb-5">
                  <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={openMyTickets}
                    disabled={createSubmitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={createSubmitting}
                  >
                    {createSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          aria-hidden="true"
                        />
                        Submitting...
                      </>
                    ) : (
                      "Submit Ticket"
                    )}
                  </button>
                </div>
              </form>
            )}
          </section>
        ) : (
          <section>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <div>
                <h1 className="page-title mb-1">
                  My Tickets
                </h1>

                <p className="page-subtitle mb-0">
                  View and manage tickets created by you.
                </p>
              </div>

              <button
                className="btn btn-success"
                type="button"
                onClick={openCreateTicket}
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
                className="zen-alert-error rounded p-3 mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3"
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
                        No tickets match your search or
                        filters.
                      </h2>

                      <p className="mb-3">
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
                      <h2 className="h5">
                        No tickets yet
                      </h2>

                      <p className="mb-3">
                        You have not created any tickets yet.
                      </p>

                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={openCreateTicket}
                      >
                        Create your first ticket
                      </button>
                    </>
                  )}
                </div>
              </section>
            ) : (
              <>
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
                                  handleSort(
                                    "ticketNumber",
                                  )
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
                                className="btn btn-link sort-button p-0"
                                onClick={() =>
                                  handleSort("createdAt")
                                }
                              >
                                Created Date
                                {getSortIndicator(
                                  "createdAt",
                                )}
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
                                {getSortIndicator(
                                  "summary",
                                )}
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
                                {getSortIndicator(
                                  "updatedAt",
                                )}
                              </button>
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {tickets.map((ticket) => (
                            <tr key={ticket.id}>
                              <td>
                                <button
                                  type="button"
                                  className="ticket-link"
                                  onClick={() =>
                                    void openTicketDetail(
                                      ticket.id,
                                    )
                                  }
                                >
                                  {ticket.ticketNumber}
                                </button>
                              </td>

                              <td>
                                {formatDate(
                                  ticket.createdAt,
                                )}
                              </td>

                              <td>{ticket.summary}</td>

                              <td>
                                {ticket.categoryName}
                              </td>

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
                                {formatDate(
                                  ticket.updatedAt,
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

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
                                <button
                                  type="button"
                                  className="ticket-link"
                                  onClick={() =>
                                    void openTicketDetail(
                                      ticket.id,
                                    )
                                  }
                                >
                                  {ticket.ticketNumber}
                                </button>
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
                                {formatDate(
                                  ticket.updatedAt,
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

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

                              <button
                                type="button"
                                className="ticket-link"
                                onClick={() =>
                                  void openTicketDetail(
                                    ticket.id,
                                  )
                                }
                              >
                                <strong>
                                  {ticket.ticketNumber}
                                </strong>
                              </button>
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

                            <span className="badge rounded-pill category-badge">
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
                            {formatDate(
                              ticket.updatedAt,
                            )}
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
                            onClick={() =>
                              goToPage(page - 1)
                            }
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
                              pageNumber === page
                                ? "active"
                                : ""
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
                            page === totalPages
                              ? "disabled"
                              : ""
                          }`}
                        >
                          <button
                            type="button"
                            className="page-link"
                            onClick={() =>
                              goToPage(page + 1)
                            }
                            disabled={
                              page === totalPages
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
        )}
      </main>
    </div>
  );
}