const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface Category {
  id: number;
  name: string;
}

export interface RelatedSystem {
  id: number;
  name: string;
}

export interface Requester {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

export type UserRole =
  | "REQUESTER"
  | "IT_STAFF"
  | "ADMIN";

export interface CurrentUser {
  id: number;
  email: string;
  displayName: string;
  role: UserRole;
  mustChangePassword: boolean;
  isActive: boolean;
}

export interface SystemStatus {
  online: boolean;
  categories: Category[];
}

export type RequestedPriority = "LOW" | "MEDIUM" | "HIGH";
export type CurrentStatus =
  | "NEW"
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_FOR_REQUESTER"
  | "RESOLVED"
  | "CLOSED"
  | "REOPENED"
  | "CANCELLED";

export interface TicketListItem {
  id: number;
  ticketNumber: string;
  summary: string;
  categoryId: number;
  categoryName: string;
  requestedPriority: RequestedPriority;
  currentStatus: CurrentStatus;
  createdAt: string;
  updatedAt: string;
}

export type ItPriority = "LOW" | "MEDIUM" | "HIGH";

export interface ItTicketListItem {
  id: number;
  ticketNumber: string;
  requesterId: number;
  categoryId: number;
  relatedSystemId: number;
  ownerId: number | null;
  summary: string;
  description: string;
  requestedPriority: RequestedPriority;
  itPriority: ItPriority;
  currentStatus: CurrentStatus;
  createdAt: string;
  updatedAt: string;
  requester?: Requester;
  category?: Category;
  relatedSystem?: RelatedSystem;
  owner?: {
    id: number;
    displayName: string;
    email: string;
  } | null;
}

export interface ItTicketListResponse {
  data: ItTicketListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ItTicketListParams {
  search?: string;
  currentStatus?: CurrentStatus;
  itPriority?: ItPriority;
  page?: number;
  pageSize?: number;
}

export interface TicketPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TicketListResponse {
  data: TicketListItem[];
  pagination: TicketPagination;
}

export interface TicketListParams {
  requesterId: number;
  search?: string;
  categoryId?: number;
  requestedPriority?: RequestedPriority;
  currentStatus?: CurrentStatus;
  sortBy?: "ticketNumber" | "createdAt" | "updatedAt" | "summary";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface CreateTicketInput {
  categoryId: number;
  relatedSystemId: number;
  summary: string;
  description: string;
  requestedPriority: RequestedPriority;
}

export interface CreatedTicket {
  id: number;
  ticketNumber: string;
  requesterId: number;
  categoryId: number;
  relatedSystemId: number;
  summary: string;
  description: string;
  requestedPriority: RequestedPriority;
  currentStatus: CurrentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TicketAttachment {
  id: number;
  ticketId?: number;
  originalFilename: string;
  storedFilename?: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  isRemoved: boolean;
  removedAt?: string | null;
  removalReason?: string | null;
}

export interface TicketDetail {
  id: number;
  ticketNumber: string;
  requesterId: number;
  categoryId: number;
  relatedSystemId: number;
  categoryName?: string;
  relatedSystemName?: string;
  category?: Category;
  relatedSystem?: RelatedSystem;
  summary: string;
  description: string;
  requestedPriority: RequestedPriority;
  currentStatus: CurrentStatus;
  createdAt: string;
  updatedAt: string;
  attachments?: TicketAttachment[];
}

export interface ItTicketDetail {
  id: number;
  ticketNumber: string;
  requesterId: number;
  requester: {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
  };
  requesterName: string;
  categoryId: number;
  category: Category;
  categoryName: string;
  relatedSystemId: number;
  relatedSystem: RelatedSystem;
  relatedSystemName: string;
  ownerId: number | null;
  owner: {
    id: number;
    displayName: string;
    email: string;
  } | null;
  summary: string;
  description: string;
  requestedPriority: RequestedPriority;
  itPriority: ItPriority;
  currentStatus: CurrentStatus;
  createdAt: string;
  updatedAt: string;
  messages: {
    id: number;
    type: string;
    body: string;
    createdAt: string;
    updatedAt: string;
    author: {
      id: number;
      displayName: string;
      email: string;
      role: string;
    };
  }[];
  attachments: TicketAttachment[];
}


export interface LoginResponse {
  user: CurrentUser;
}

export interface ChangePasswordResponse {
  message: string;
}

// ---------------------------------------------------------------------------
// Lab 3 - Authentication
// ---------------------------------------------------------------------------

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Invalid email or password",
      ),
    );
  }

  return response.json();
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Unable to log out.",
      ),
    );
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResponse> {
  const response = await fetch(
    `${API_URL}/api/auth/change-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Unable to change password.",
      ),
    );
  }

  return response.json();
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await fetch(
    `${API_URL}/api/auth/me`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "You must be logged in.",
      ),
    );
  }

  const data = (await response.json()) as {
    user: CurrentUser;
  };

  return data.user;
}

// ---------------------------------------------------------------------------
// Existing Lab 1 / Lab 2 API
// ---------------------------------------------------------------------------

export async function checkSystem(): Promise<SystemStatus> {
  const healthRes = await fetch(`${API_URL}/api/health`);

  if (!healthRes.ok) {
    throw new Error("Unable to connect to TokTickIT API");
  }

  const healthData = await healthRes.json();

  if (healthData.status !== "ok") {
    throw new Error("Unable to connect to TokTickIT API");
  }

  const catRes = await fetch(`${API_URL}/api/categories`);

  if (!catRes.ok) {
    throw new Error("Unable to connect to TokTickIT API");
  }

  const categories: Category[] = await catRes.json();

  return { online: true, categories };
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/api/categories`);

  if (!response.ok) {
    throw new Error("Unable to retrieve categories.");
  }

  return response.json();
}

export async function getRelatedSystems(): Promise<RelatedSystem[]> {
  const response = await fetch(`${API_URL}/api/related-systems`);

  if (!response.ok) {
    throw new Error("Unable to retrieve related systems.");
  }

  return response.json();
}

export async function getRequesters(): Promise<Requester[]> {
  const response = await fetch(`${API_URL}/api/requesters`);

  if (!response.ok) {
    throw new Error("Unable to retrieve requesters.");
  }

  return response.json();
}

export async function createTicket(
  requesterId: number,
  input: CreateTicketInput,
): Promise<CreatedTicket> {
  const response = await fetch(`${API_URL}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requester-Id": String(requesterId),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    let message = "Unable to create ticket.";

    try {
      const errorData = await response.json();

      if (typeof errorData?.message === "string") {
        message = errorData.message;
      } else if (typeof errorData?.error === "string") {
        message = errorData.error;
      }
    } catch {
      // Keep the default message when the response is not JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function getTickets(
  params: TicketListParams,
): Promise<TicketListResponse> {
  const searchParams = new URLSearchParams();

  searchParams.set("requesterId", String(params.requesterId));

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.categoryId !== undefined) {
    searchParams.set("categoryId", String(params.categoryId));
  }

  if (params.requestedPriority) {
    searchParams.set(
      "requestedPriority",
      params.requestedPriority,
    );
  }

  if (params.currentStatus) {
    searchParams.set("currentStatus", params.currentStatus);
  }

  if (params.sortBy) {
    searchParams.set("sortBy", params.sortBy);
  }

  if (params.sortOrder) {
    searchParams.set("sortOrder", params.sortOrder);
  }

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  const response = await fetch(
    `${API_URL}/api/tickets?${searchParams.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Unable to retrieve tickets.");
  }

  return response.json();
}

export async function getItTickets(
  params: ItTicketListParams = {},
): Promise<ItTicketListResponse> {
  const searchParams = new URLSearchParams();

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.currentStatus) {
    searchParams.set("currentStatus", params.currentStatus);
  }

  if (params.itPriority) {
    searchParams.set("itPriority", params.itPriority);
  }

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  const response = await fetch(
    `${API_URL}/api/it/tickets?${searchParams.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Unable to retrieve IT tickets.");
  }

  return response.json();
}


export async function getTicketDetail(
  requesterId: number,
  ticketId: number,
): Promise<TicketDetail> {
  const searchParams = new URLSearchParams();

  searchParams.set("requesterId", String(requesterId));

  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}?${searchParams.toString()}`,
  );

  if (!response.ok) {
    let message = "Unable to retrieve ticket details.";

    try {
      const errorData = await response.json();

      if (typeof errorData?.message === "string") {
        message = errorData.message;
      } else if (typeof errorData?.error === "string") {
        message = errorData.error;
      }
    } catch {
      // Keep the default message when the response is not JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function getItTicketDetail(
  ticketId: number,
): Promise<ItTicketDetail> {
  const response = await fetch(
    `${API_URL}/api/it/tickets/${ticketId}`,
  );

  if (!response.ok) {
    let message = "Unable to retrieve IT Staff ticket detail.";

    try {
      const errorData = await response.json();

      if (typeof errorData?.message === "string") {
        message = errorData.message;
      } else if (typeof errorData?.error === "string") {
        message = errorData.error;
      }
    } catch {
      // Keep the default message when the response is not JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function addPublicComment(
  ticketId: number,
  body: string,
): Promise<ItTicketDetail["messages"][number]> {
  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ body }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Unable to create public comment.",
      ),
    );
  }

  const data = (await response.json()) as {
    message: ItTicketDetail["messages"][number];
  };

  return data.message;
}

export async function addInternalNote(
  ticketId: number,
  body: string,
): Promise<ItTicketDetail["messages"][number]> {
  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}/internal-notes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ body }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Unable to add internal note.",
      ),
    );
  }

  return response.json();
}

export async function uploadAttachment(
  requesterId: number,
  ticketId: number,
  file: File,
): Promise<TicketAttachment> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}/attachments`,
    {
      method: "POST",
      headers: {
        "X-Requester-Id": String(requesterId),
      },
      body: formData,
    },
  );

  if (!response.ok) {
    let message = "Unable to upload attachment.";

    try {
      const errorData = await response.json();

      if (typeof errorData?.message === "string") {
        message = errorData.message;
      } else if (typeof errorData?.error === "string") {
        message = errorData.error;
      }
    } catch {
      // Keep the default message when the response is not JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function downloadAttachment(
  requesterId: number,
  attachmentId: number,
): Promise<Blob> {
  const response = await fetch(
    `${API_URL}/api/attachments/${attachmentId}/download`,
    {
      headers: {
        "X-Requester-Id": String(requesterId),
      },
    },
  );

  if (!response.ok) {
    let message = "Unable to open attachment.";

    try {
      const errorData = await response.json();

      if (typeof errorData?.message === "string") {
        message = errorData.message;
      } else if (typeof errorData?.error === "string") {
        message = errorData.error;
      }
    } catch {
      // Keep the default message when the response is not JSON.
    }

    throw new Error(message);
  }

  return response.blob();
}

export async function removeAttachment(
  requesterId: number,
  attachmentId: number,
  reason: string,
): Promise<TicketAttachment> {
  const response = await fetch(
    `${API_URL}/api/attachments/${attachmentId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Requester-Id": String(requesterId),
      },
      body: JSON.stringify({ reason }),
    },
  );

  if (!response.ok) {
    let message = "Unable to remove attachment.";

    try {
      const errorData = await response.json();

      if (typeof errorData?.message === "string") {
        message = errorData.message;
      } else if (typeof errorData?.error === "string") {
        message = errorData.error;
      }
    } catch {
      // Keep the default message when the response is not JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Lab 3 - Administrator User Management
// ---------------------------------------------------------------------------

export interface AdminUser {
  id: number;
  email: string;
  displayName: string;
  role: UserRole;
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListResponse {
  data: AdminUser[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAdminUserInput {
  displayName: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface UpdateAdminUserInput {
  displayName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface SetInitialPasswordInput {
  password: string;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
  fields?: Record<string, string>;
}

async function getApiErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const errorData =
      (await response.json()) as ApiErrorResponse;

    if (
      errorData.fields &&
      Object.keys(errorData.fields).length > 0
    ) {
      return Object.values(errorData.fields).join(" ");
    }

    if (typeof errorData.message === "string") {
      return errorData.message;
    }

    if (typeof errorData.error === "string") {
      return errorData.error;
    }
  } catch {
    // Keep fallback when the response is not JSON.
  }

  return fallback;
}

export async function getAdminUsers(
  search = "",
): Promise<AdminUserListResponse> {
  const searchParams = new URLSearchParams();

  if (search.trim()) {
    searchParams.set("search", search.trim());
  }

  const query = searchParams.toString();

  const response = await fetch(
    `${API_URL}/api/admin/users${query ? `?${query}` : ""}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Unable to retrieve users.",
      ),
    );
  }

  return response.json();
}

export async function createAdminUser(
  input: CreateAdminUserInput,
): Promise<AdminUser> {
  const response = await fetch(
    `${API_URL}/api/admin/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Unable to create user.",
      ),
    );
  }

  const data = (await response.json()) as {
    user: AdminUser;
  };

  return data.user;
}

export async function updateAdminUser(
  userId: number,
  input: UpdateAdminUserInput,
): Promise<AdminUser> {
  const response = await fetch(
    `${API_URL}/api/admin/users/${userId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Unable to update user.",
      ),
    );
  }

  const data = (await response.json()) as {
    user: AdminUser;
  };

  return data.user;
}

export async function setAdminUserInitialPassword(
  userId: number,
  input: SetInitialPasswordInput,
): Promise<AdminUser> {
  const response = await fetch(
    `${API_URL}/api/admin/users/${userId}/initial-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Unable to set initial password.",
      ),
    );
  }

  const data = (await response.json()) as {
    user: AdminUser;
  };

  return data.user;
}