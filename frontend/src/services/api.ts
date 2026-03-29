/**
 * API Client Base Class
 * 
 * This provides the foundation for all API interactions.
 * Currently configured for mock/local testing, easily upgradeable to real backend.
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface ApiConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(config?: ApiConfig) {
    this.baseUrl = config?.baseUrl || 'http://localhost:3001/api';
    this.timeout = config?.timeout || 30000;
    this.headers = {
      'Content-Type': 'application/json',
      ...config?.headers,
    };
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: `API Error: ${response.status}`,
          statusCode: response.status,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
        statusCode: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        statusCode: 0,
      };
    }
  }

  /**
   * GET request
   */
  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Global API client instance
export const apiClient = new ApiClient();
