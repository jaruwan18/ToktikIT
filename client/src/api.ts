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

export interface SystemStatus {
  online: boolean;
  categories: Category[];
}

export type RequestedPriority = "LOW" | "MEDIUM" | "HIGH";
export type CurrentStatus = "NEW";

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
    searchParams.set("requestedPriority", params.requestedPriority);
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
