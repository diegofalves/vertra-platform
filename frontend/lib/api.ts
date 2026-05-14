const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? "Erro na requisição");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Client {
  id: string;
  organization_id: string;
  name: string;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientCreate {
  organization_id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
}

export interface ClientUpdate {
  name?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  active?: boolean;
}

export interface Project {
  id: string;
  client_id: string;
  client_name: string | null;
  organization_id: string;
  name: string;
  description: string | null;
  status: "active" | "paused" | "completed";
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  client_id: string;
  organization_id: string;
  name: string;
  description?: string;
  status?: "active" | "paused" | "completed";
  started_at?: string;
  finished_at?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  status?: "active" | "paused" | "completed";
  started_at?: string;
  finished_at?: string;
}

export interface ShipmentRecord {
  id: string;
  project_id: string;
  organization_id: string;
  nf_number: string | null;
  nf_date: string | null;
  nf_value: number | null;
  sender_name: string | null;
  sender_city: string | null;
  sender_state: string | null;
  recipient_name: string | null;
  recipient_address: string | null;
  recipient_city: string | null;
  recipient_state: string | null;
  recipient_zipcode: string | null;
  weight_kg: number | null;
  volume_m3: number | null;
  freight_value: number | null;
  freight_modality: string | null;
  carrier_name: string | null;
  delivery_deadline: number | null;
  delivery_date: string | null;
  latitude: number | null;
  longitude: number | null;
  geocoding_status: string;
  created_at: string;
  updated_at: string;
}

export interface GeocodeResponse {
  latitude: number;
  longitude: number;
  formatted_address: string;
  source: string;
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export const fetchClients = (organizationId: string): Promise<Client[]> =>
  request(`/api/v1/clients?organization_id=${organizationId}`);

export const createClient = (data: ClientCreate): Promise<Client> =>
  request("/api/v1/clients", { method: "POST", body: JSON.stringify(data) });

export const updateClient = (id: string, data: ClientUpdate): Promise<Client> =>
  request(`/api/v1/clients/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteClient = (id: string): Promise<void> =>
  request(`/api/v1/clients/${id}`, { method: "DELETE" });

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const fetchProjects = (organizationId: string, clientId?: string): Promise<Project[]> => {
  const qs = clientId
    ? `organization_id=${organizationId}&client_id=${clientId}`
    : `organization_id=${organizationId}`;
  return request(`/api/v1/projects?${qs}`);
};

export const createProject = (data: ProjectCreate): Promise<Project> =>
  request("/api/v1/projects", { method: "POST", body: JSON.stringify(data) });

export const updateProject = (id: string, data: ProjectUpdate): Promise<Project> =>
  request(`/api/v1/projects/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteProject = (id: string): Promise<void> =>
  request(`/api/v1/projects/${id}`, { method: "DELETE" });

// ---------------------------------------------------------------------------
// Shipments
// ---------------------------------------------------------------------------

export const fetchShipments = (projectId: string): Promise<ShipmentRecord[]> =>
  request(`/api/v1/projects/${projectId}/shipments`);

export const createShipment = (projectId: string, data: Partial<ShipmentRecord>): Promise<ShipmentRecord> =>
  request(`/api/v1/projects/${projectId}/shipments`, { method: "POST", body: JSON.stringify(data) });

export const bulkImportShipments = (projectId: string, records: Partial<ShipmentRecord>[]): Promise<{ inserted: number; failed: number; total: number }> =>
  request(`/api/v1/projects/${projectId}/shipments/bulk`, { method: "POST", body: JSON.stringify(records) });

// ---------------------------------------------------------------------------
// Geocoding
// ---------------------------------------------------------------------------

export const geocodeAddress = (address: string): Promise<GeocodeResponse> =>
  request("/api/v1/geocode", { method: "POST", body: JSON.stringify({ address }) });

export const batchGeocode = (addresses: string[]): Promise<{ results: Record<string, GeocodeResponse | null> }> =>
  request("/api/v1/geocode/batch", { method: "POST", body: JSON.stringify({ addresses }) });
