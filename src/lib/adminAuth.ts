export interface AdminSession {
  email: string;
  name: string;
  role: "admin";
}

interface AdminCredentials {
  email: string;
  password: string;
  name: string;
}

const ADMIN_SESSION_KEY = "showtime_admin_session";
const ADMIN_AUTH_EVENT = "admin-auth-changed";
const ADMIN_CREDENTIALS_STORAGE_KEY = "showtime_admin_credentials";

const DEFAULT_ADMINS: AdminCredentials[] = [
  {
    email: "admin@showtime.com",
    password: "Admin123!",
    name: "ShowTime Admin",
  },
];

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

const ensureAdminCredentials = () => {
  const existing = readJson<AdminCredentials[]>(ADMIN_CREDENTIALS_STORAGE_KEY, []);
  if (existing.length === 0) {
    writeJson(ADMIN_CREDENTIALS_STORAGE_KEY, DEFAULT_ADMINS);
    return DEFAULT_ADMINS;
  }

  return existing;
};

export const getAdminSession = (): AdminSession | null =>
  readJson<AdminSession | null>(ADMIN_SESSION_KEY, null);

export const isAdminAuthenticated = () => !!getAdminSession();

export const loginAdmin = (email: string, password: string): AdminSession | null => {
  const admins = ensureAdminCredentials();
  const admin = admins.find(
    (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password,
  );

  if (!admin) {
    return null;
  }

  const session: AdminSession = {
    email: admin.email,
    name: admin.name,
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
