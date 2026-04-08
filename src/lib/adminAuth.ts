export interface AdminSession {
  email: string;
  name: string;
  role: "admin";
}

const ADMIN_SESSION_KEY = "rocktime_admin_session";
const ADMIN_AUTH_EVENT = "admin-auth-changed";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev";
const ADMIN_AUTH_ENDPOINT = `${API_BASE_URL}/adminAuth`;

const canUseStorage = () => typeof window !== "undefined";

const readJson = <T,>(key: string, fallback: T): T => {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = <T,>(key: string, value: T) => {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const getAdminSession = (): AdminSession | null =>
  readJson<AdminSession | null>(ADMIN_SESSION_KEY, null);

export const isAdminAuthenticated = () => !!getAdminSession();

export const loginAdmin = async (email: string, password: string): Promise<AdminSession> => {
  const response = await fetch(ADMIN_AUTH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: email.trim(),
      password,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Invalid admin credentials");
  }

  const session: AdminSession = {
    email: data?.email || email.trim().toLowerCase(),
    name: data?.name || "RockTime Admin",
    role: "admin",
  };

  writeJson(ADMIN_SESSION_KEY, session);
  window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
  return session;
};

export const logoutAdmin = () => {
  if (!canUseStorage()) return;
  localStorage.removeItem(ADMIN_SESSION_KEY);
  window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
};

export const getAdminAuthEventName = () => ADMIN_AUTH_EVENT;
