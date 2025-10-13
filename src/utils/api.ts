import type { Supplier } from "../types";

const API_URL = "http://localhost:4000/api";

type AuthFetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

type ApiError = Error & {
  status?: number;
  data?: unknown;
};

const parseJson = async (res: Response) => {
  try {
    return await res.json();
  } catch (error) {
    return null;
  }
};

const authFetch = async <T>(
  endpoint: string,
  options: AuthFetchOptions = {}
): Promise<T> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await parseJson(response);

  if (!response.ok) {
    const message =
      (data as any)?.error ||
      (data as any)?.message ||
      response.statusText ||
      "Request failed";
    const error = new Error(message) as ApiError;
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
};

export const fetchSuppliers = () => {
  return authFetch<{
    items: Supplier[];
    total: number;
    page: number;
    pages: number;
  }>("/suppliers");
};

export const createSupplier = (supplier: Supplier) => {
  return authFetch<Supplier>("/suppliers", {
    method: "POST",
    body: JSON.stringify(supplier),
  });
};

export const updateSupplier = (id: string, supplier: Supplier) => {
  return authFetch<Supplier>(`/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(supplier),
  });
};

export const deleteSupplier = (id: string) => {
  return authFetch<{ message: string }>(`/suppliers/${id}`, {
    method: "DELETE",
  });
};

export interface ProcurementChangeRequestInput {
  entityType: "supplier" | "purchaseOrder";
  actionType: "create" | "update" | "delete";
  targetId?: string | null;
  payload?: Record<string, unknown>;
  reason?: string | null;
}

export const submitProcurementChangeRequest = (
  request: ProcurementChangeRequestInput
) => {
  return authFetch<{ message: string }>("/procurement-requests", {
    method: "POST",
    body: JSON.stringify(request),
  });
};

export interface ProcurementChangeRequest {
  _id: string;
  entityType: "supplier" | "purchaseOrder";
  actionType: "create" | "update" | "delete";
  status: "pending" | "approved" | "rejected";
  targetId?: string | null;
  payload?: Record<string, unknown>;
  reason?: string | null;
  approvalNote?: string | null;
  requestedByName: string;
  requestedByLevel: string;
  requestedByDepartment: string;
  createdAt: string;
  updatedAt: string;
}

export const fetchProcurementChangeRequests = (params?: {
  status?: string;
}) => {
  const query = params?.status
    ? `?status=${encodeURIComponent(params.status)}`
    : "";
  return authFetch<{ requests: ProcurementChangeRequest[] }>(
    `/procurement-requests${query}`
  );
};

export const approveProcurementChangeRequest = (
  id: string,
  approvalNote?: string
) => {
  const body = approvalNote?.trim()
    ? JSON.stringify({ approvalNote })
    : JSON.stringify({});
  return authFetch<{ message: string }>(`/procurement-requests/${id}/approve`, {
    method: "POST",
    body,
  });
};

export const rejectProcurementChangeRequest = (
  id: string,
  approvalNote?: string
) => {
  const body = approvalNote?.trim()
    ? JSON.stringify({ approvalNote })
    : JSON.stringify({});
  return authFetch<{ message: string }>(`/procurement-requests/${id}/reject`, {
    method: "POST",
    body,
  });
};
