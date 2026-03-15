// API response helpers
import type { ApiResponse, ApiError } from "@floodshield/shared";

export function ok<T>(data: T): ApiResponse<T> {
  return {
    data,
    error: null,
    timestamp: new Date().toISOString(),
  };
}

export function err(code: string, message: string, details?: unknown): ApiError {
  return {
    data: null,
    error: { code, message, details },
    timestamp: new Date().toISOString(),
  };
}
