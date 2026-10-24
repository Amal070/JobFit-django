import type { Feedback, Resume } from "~/types";

export const getApiBase = () => {
  let envUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
  if (envUrl) {
    // Strip trailing slashes to avoid double slashes when building endpoint paths
    envUrl = envUrl.replace(/\/+$/, "");
    if (!envUrl.endsWith("/api")) {
      envUrl = `${envUrl}/api`;
    }
    return envUrl;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname || "127.0.0.1";
    return `http://${host}:8000/api`;
  }
  return "http://127.0.0.1:8000/api";
};

export const API_BASE = getApiBase();
const AUTH_TOKEN_KEY = "authToken";
const AUTH_REFRESH_KEY = "authRefreshToken";
const AUTH_USERNAME_KEY = "authUsername";

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

const getRefreshToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_REFRESH_KEY);
};

const setAuthToken = (token: string, refreshToken: string, username: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_REFRESH_KEY, refreshToken);
  localStorage.setItem(AUTH_USERNAME_KEY, username);
};

const clearAuthToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_REFRESH_KEY);
  localStorage.removeItem(AUTH_USERNAME_KEY);
};

const getAuthUsername = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_USERNAME_KEY);
};

const authHeader = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const refreshAuthToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthToken();
    return null;
  }

  const response = await fetch(`${API_BASE}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    clearAuthToken();
    return null;
  }

  const data = await response.json();
  const access = data.access || data.tokens?.access || null;
  const refresh = data.refresh || data.tokens?.refresh || refreshToken;

  if (!access) {
    clearAuthToken();
    return null;
  }

  const username = getAuthUsername() || "";
  setAuthToken(access, refresh, username);
  return access;
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const mergedOptions = {
    ...options,
    headers: {
      ...((options.headers as Record<string, string>) || {}),
      ...authHeader(),
    },
  };

  let response: Response;
  try {
    response = await fetch(url, mergedOptions);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(
        `Unable to reach backend server at ${API_BASE}. Please make sure the Django server is running.`
      );
    }
    throw err;
  }

  if (response.status === 401) {
    const newAccess = await refreshAuthToken();
    if (!newAccess) {
      throw new Error("Session expired. Please sign in again.");
    }

    try {
      response = await fetch(url, {
        ...mergedOptions,
        headers: {
          ...((mergedOptions.headers as Record<string, string>) || {}),
          Authorization: `Bearer ${newAccess}`,
        },
      });
    } catch (err) {
      if (err instanceof TypeError) {
        throw new Error(
          `Unable to reach backend server at ${API_BASE}. Please make sure the Django server is running.`
        );
      }
      throw err;
    }
  }

  return response;
};

const normalizeResume = (raw: any): Resume => ({
  id: raw.id,
  companyName: raw.company_name,
  jobTitle: raw.job_title,
  imagePath: raw.image_file || "",
  resumePath: raw.pdf_file,
  feedback: raw.feedback,
});

export const isAuthenticated = () => Boolean(getAuthToken());

export const getCurrentUsername = () => getAuthUsername() || "";

const formatErrorResponse = async (response: Response, defaultMsg: string): Promise<string> => {
  try {
    const data = await response.json();
    if (typeof data === "object" && data !== null) {
      const messages = Object.entries(data)
        .map(([key, val]) => {
          const detail = Array.isArray(val) ? val.join(" ") : String(val);
          return key === "detail" || key === "error" ? detail : `${key}: ${detail}`;
        })
        .join(" | ");
      return messages || defaultMsg;
    }
  } catch {
    try {
      const text = await response.text();
      if (text) return text;
    } catch {
      // ignore
    }
  }
  return defaultMsg;
};

export const signUp = async (username: string, password: string) => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Unable to reach backend server at ${API_BASE}. Please make sure the Django server is running.`);
    }
    throw err;
  }

  if (!response.ok) {
    const msg = await formatErrorResponse(response, "Registration failed");
    throw new Error(msg);
  }

  const data = await response.json();
  const accessToken = data.access || data.tokens?.access || null;
  const refreshToken = data.refresh || data.tokens?.refresh || null;

  if (accessToken && refreshToken) {
    setAuthToken(accessToken, refreshToken, username);
  }
  return { user: data.user, token: accessToken, username };
};

export const signIn = async (username: string, password: string) => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Unable to reach backend server at ${API_BASE}. Please make sure the Django server is running.`);
    }
    throw err;
  }

  if (!response.ok) {
    const msg = await formatErrorResponse(response, "Login failed. Check your username and password.");
    throw new Error(msg);
  }

  const data = await response.json();
  const accessToken = data.access || data.tokens?.access || null;
  const refreshToken = data.refresh || data.tokens?.refresh || null;

  if (!accessToken || !refreshToken) {
    throw new Error("Missing authentication tokens from login response");
  }

  setAuthToken(accessToken, refreshToken, username);
  return { token: accessToken, username };
};

export const signOut = () => {
  clearAuthToken();
};

export const listResumes = async (): Promise<Resume[]> => {
  const response = await fetchWithAuth(`${API_BASE}/resumes/`, {
    headers: {},
  });

  if (!response.ok) {
    throw new Error("Failed to load resumes");
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map(normalizeResume);
};

export const getResume = async (id: string): Promise<Resume> => {
  const response = await fetchWithAuth(`${API_BASE}/resumes/${id}/`, {
    headers: {},
  });

  if (!response.ok) {
    throw new Error("Failed to load resume");
  }

  const data = await response.json();
  return normalizeResume(data);
};

export const uploadResume = async (
  resumeFile: File,
  metadata: { company_name: string; job_title: string; job_description: string }
) => {
  const formData = new FormData();
  formData.append("pdf_file", resumeFile);
  formData.append("company_name", metadata.company_name);
  formData.append("job_title", metadata.job_title);
  formData.append("job_description", metadata.job_description);

  const response = await fetchWithAuth(`${API_BASE}/resumes/upload/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const msg = await formatErrorResponse(response, "Resume upload failed");
    throw new Error(msg);
  }

  const data = await response.json();
  return {
    id: data.resume_id,
    pdfPath: data.pdf_path,
    imagePath: data.image_path || "",
  };
};

export const analyzeResume = async (resumeId: string, message?: string, force: boolean = false) => {
  const response = await fetchWithAuth(`${API_BASE}/resumes/${resumeId}/analyze/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: message || "", force }),
  });

  if (!response.ok) {
    const msg = await formatErrorResponse(response, "Analyze request failed");
    throw new Error(msg);
  }

  return response.json();
};

export const fetchFile = async (path: string): Promise<Blob> => {
  const response = await fetchWithAuth(`${API_BASE}/resumes/file/${encodeURIComponent(path)}/`, {
    headers: {},
  });

  if (!response.ok) {
    throw new Error("File not found");
  }

  return response.blob();
};

export const deleteResume = async (id: string): Promise<void> => {
  const response = await fetchWithAuth(`${API_BASE}/resumes/${id}/delete/`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const msg = await formatErrorResponse(response, "Failed to delete resume");
    throw new Error(msg);
  }
};
