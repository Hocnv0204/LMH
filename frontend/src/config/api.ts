// API Configuration
export const API_CONFIG = {
  // BASE_URL: 'http://localhost:8081',
  BASE_URL: 'https://api-lmh-writting-practice.id.vn',
} as const;

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
};