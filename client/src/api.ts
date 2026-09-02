const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface Category {
  id: number;
  name: string;
}

export interface SystemStatus {
  online: boolean;
  categories: Category[];
}

export interface TicketListItem {
  id: number;
  ticketNumber: string;
  summary: string;
  categoryId: number;
  categoryName: string;
  requestedPriority: "LOW" | "MEDIUM" | "HIGH";
  currentStatus: "NEW";
  createdAt: string;
  updatedAt: string;
}

export interface TicketPagination {
  page: number;
  pageSize: number;
  totalItems: number;
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
  requestedPriority?: "LOW" | "MEDIUM" | "HIGH";
  currentStatus?: "NEW";
  sortBy?: "ticketNumber" | "createdAt" | "updatedAt" | "summary";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
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

  return {
    online: true,
    categories,
  };
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/api/categories`);

  if (!response.ok) {
    throw new Error("Unable to retrieve categories.");
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