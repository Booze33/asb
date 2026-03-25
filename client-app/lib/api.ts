export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    admin: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

// Dashboard interfaces
export interface DashboardFilters {
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface DashboardResponse {
  success: boolean;
  data: {
    appointments: Appointment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface Appointment {
  id: number;
  name: string;
  email: string;
  date_time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'missed';
  created_at: string;
  updated_at: string;
}

// Appointment creation interface
export interface CreateAppointmentRequest {
  client_name: string;
  client_email: string;
  date_time: string;
  duration: number;
}

export interface CreateAppointmentResponse {
  success: boolean;
  message: string;
  data: Appointment;
}

// Appointment update interface
export interface UpdateAppointmentRequest {
  date_time?: string;
  duration?: number;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'missed';
}

export interface UpdateAppointmentResponse {
  success: boolean;
  message: string;
  data: Appointment;
}

// Admin interfaces
export interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AdminResponse {
  success: boolean;
  data: Admin;
}

class ApiService {
  private baseURL: string;

  constructor() {
    // In development, we'll use the server port 3008
    // In production, this would be the actual API URL
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008';
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      
      if (isJson) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || 'An error occurred';
        } catch {
          errorMessage = response.statusText || 'An error occurred';
        }
      } else {
        errorMessage = response.statusText || 'An error occurred';
      }

      throw new Error(errorMessage);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    if (isJson) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/api/admin/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
      credentials: 'include', // Include cookies in the request
    });

    return this.handleResponse<LoginResponse>(response);
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await fetch(`${this.baseURL}/api/admin/forgot-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
      credentials: 'include', // Include cookies in the request
    });

    return this.handleResponse<ForgotPasswordResponse>(response);
  }

  // Admin endpoints
  async getAdminProfile(): Promise<AdminResponse> {
    const response = await fetch(`${this.baseURL}/api/admin/profile`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include', // Include cookies in the request
    });

    return this.handleResponse<AdminResponse>(response);
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/api/admin/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include', // Include cookies in the request
    });

    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  // Dashboard endpoints
  async getDashboard(page: number = 1, limit: number = 10, filters?: DashboardFilters): Promise<DashboardResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.start_date) {
      params.append('start_date', filters.start_date);
    }
    if (filters?.end_date) {
      params.append('end_date', filters.end_date);
    }

    const response = await fetch(`${this.baseURL}/api/admin/dashboard?${params.toString()}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include', // Include cookies in the request
    });

    return this.handleResponse<DashboardResponse>(response);
  }

  // Appointment management endpoints
  async createAppointment(data: CreateAppointmentRequest): Promise<CreateAppointmentResponse> {
    const response = await fetch(`${this.baseURL}/api/appointments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include', // Include cookies in the request
    });

    return this.handleResponse<CreateAppointmentResponse>(response);
  }

  async getAppointment(id: number, email: string): Promise<{ success: boolean; data: Appointment }> {
    const response = await fetch(`${this.baseURL}/api/appointments/${id}?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include', // Include cookies in the request
    });

    return this.handleResponse<{ success: boolean; data: Appointment }>(response);
  }

  async updateAppointment(id: number, data: UpdateAppointmentRequest): Promise<UpdateAppointmentResponse> {
    const response = await fetch(`${this.baseURL}/api/admin/appointments/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include', // Include cookies in the request
    });

    return this.handleResponse<UpdateAppointmentResponse>(response);
  }

  async cancelAppointment(id: number): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/api/admin/appointments/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include', // Include cookies in the request
    });

    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  // Utility methods
  isAuthenticated(): boolean {
    // For cookie-based auth, we need to check if we have a valid session
    // This is typically done by making a request to a protected endpoint
    // or checking for the presence of auth cookies
    return true; // This will be handled by the server-side session
  }
}

// Cache interfaces
export interface CacheStats {
  connected: boolean;
  keyCount: number;
  memoryUsage: string;
  timestamp: string;
}

export interface CacheHealth {
  status: 'healthy' | 'unhealthy';
  connected: boolean;
  keyCount: number;
  memoryUsage: number;
  timestamp: string;
  error?: string;
}

// Cache endpoints
export async function getCacheStats(): Promise<{ success: boolean; data: CacheStats }> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008';
  const response = await fetch(`${baseURL}/api/cache/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    if (isJson) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || 'An error occurred';
      } catch {
        errorMessage = response.statusText || 'An error occurred';
      }
    } else {
      errorMessage = response.statusText || 'An error occurred';
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as { success: boolean; data: CacheStats };
  }

  if (isJson) {
    return response.json();
  }

  return response.text() as unknown as { success: boolean; data: CacheStats };
}

export async function clearCache(): Promise<{ success: boolean; message: string }> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008';
  const response = await fetch(`${baseURL}/api/cache/clear`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    if (isJson) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || 'An error occurred';
      } catch {
        errorMessage = response.statusText || 'An error occurred';
      }
    } else {
      errorMessage = response.statusText || 'An error occurred';
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as { success: boolean; message: string };
  }

  if (isJson) {
    return response.json();
  }

  return response.text() as unknown as { success: boolean; message: string };
}

export async function invalidateCache(pattern: string): Promise<{ success: boolean; message: string }> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008';
  const response = await fetch(`${baseURL}/api/cache/invalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pattern }),
    credentials: 'include',
  });
  
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    if (isJson) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || 'An error occurred';
      } catch {
        errorMessage = response.statusText || 'An error occurred';
      }
    } else {
      errorMessage = response.statusText || 'An error occurred';
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as { success: boolean; message: string };
  }

  if (isJson) {
    return response.json();
  }

  return response.text() as unknown as { success: boolean; message: string };
}

export async function getCacheHealth(): Promise<{ success: boolean; data: CacheHealth }> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008';
  const response = await fetch(`${baseURL}/api/cache/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    if (isJson) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || 'An error occurred';
      } catch {
        errorMessage = response.statusText || 'An error occurred';
      }
    } else {
      errorMessage = response.statusText || 'An error occurred';
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as { success: boolean; data: CacheHealth };
  }

  if (isJson) {
    return response.json();
  }

  return response.text() as unknown as { success: boolean; data: CacheHealth };
}

// Health endpoints
export async function getHealth(): Promise<{ status: string; timestamp: string; uptime: number }> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008';
  const response = await fetch(`${baseURL}/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    if (isJson) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || 'An error occurred';
      } catch {
        errorMessage = response.statusText || 'An error occurred';
      }
    } else {
      errorMessage = response.statusText || 'An error occurred';
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as { status: string; timestamp: string; uptime: number };
  }

  if (isJson) {
    return response.json();
  }

  return response.text() as unknown as { status: string; timestamp: string; uptime: number };
}

export async function getReadiness(): Promise<{ status: string; timestamp: string }> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008';
  const response = await fetch(`${baseURL}/health/ready`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    if (isJson) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || 'An error occurred';
      } catch {
        errorMessage = response.statusText || 'An error occurred';
      }
    } else {
      errorMessage = response.statusText || 'An error occurred';
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as { status: string; timestamp: string };
  }

  if (isJson) {
    return response.json();
  }

  return response.text() as unknown as { status: string; timestamp: string };
}

export async function getLiveness(): Promise<{ status: string; timestamp: string; pid: number; uptime: number }> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008';
  const response = await fetch(`${baseURL}/health/live`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    if (isJson) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || 'An error occurred';
      } catch {
        errorMessage = response.statusText || 'An error occurred';
      }
    } else {
      errorMessage = response.statusText || 'An error occurred';
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as { status: string; timestamp: string; pid: number; uptime: number };
  }

  if (isJson) {
    return response.json();
  }

  return response.text() as unknown as { status: string; timestamp: string; pid: number; uptime: number };
}

export const apiService = new ApiService();
