// Utility functions for handling base path
const BASE_PATH = '/app/WebDevProject2';

export const getApiUrl = (path: string) => {
  return `${BASE_PATH}${path}`;
};

// For href attributes, we need the full path including base path
export const getPageUrl = (path: string) => {
  return `${BASE_PATH}${path}`;
};

// For router.push(), Next.js automatically handles base path
export const getRouterUrl = (path: string) => {
  return path;
};

export const BASE_PATH_URL = BASE_PATH;
