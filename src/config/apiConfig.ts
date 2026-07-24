export const ApiConfig = {
  // Use a relative URL in development so Vite can proxy requests and avoid CORS issues.
  baseUrl: import.meta.env.VITE_API_BASE_URL || '',
};
