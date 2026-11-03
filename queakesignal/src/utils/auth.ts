import { Screen, UserSession } from "../types";

/**
 * Retorna la URL base correspondiente (localhost en desarrollo o DuckDNS en producción).
 */
export function getApiUrl(endpoint: string): string {
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const base = isLocal ? "http://localhost:3001" : "https://quakesignal.duckdns.org";
  return `${base}${endpoint}`;
}

/**
 * Obtiene el usuario autenticado desde el almacenamiento de sesión local.
 */
export function getCurrentUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Obtiene el token JWT actual de la sesión.
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("token") || localStorage.getItem("token") || null;
}

/**
 * Genera los encabezados HTTP con autorización Bearer si existe token.
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Valida si el usuario actual o proporcionado tiene rol de Administrador.
 */
export function isAdmin(user?: UserSession | null): boolean {
  const activeUser = user !== undefined ? user : getCurrentUser();
  if (!activeUser || !activeUser.role) return false;
  const role = String(activeUser.role).toLowerCase().trim();
  return role === "admin" || role === "administrador";
}

/**
 * Valida si el usuario actual o proporcionado tiene rol de Operador.
 */
export function isOperador(user?: UserSession | null): boolean {
  const activeUser = user !== undefined ? user : getCurrentUser();
  if (!activeUser || !activeUser.role) return false;
  const role = String(activeUser.role).toLowerCase().trim();
  return role === "operador";
}

/**
 * Verifica si un usuario tiene autorización para acceder a una pantalla específica
 * respetando el principio de mínimo privilegio.
 */
export function canAccessScreen(screen: Screen, user?: UserSession | null): boolean {
  const adminOnlyScreens: Screen[] = ["configuracion", "usuarios"];
  if (adminOnlyScreens.includes(screen)) {
    return isAdmin(user);
  }
  return true;
}

/**
 * Verifica si el usuario tiene autorización para usar el Botón de Pánico.
 * (Mínimo privilegio: solo Administrador).
 */
export function canAccessPanicButton(user?: UserSession | null): boolean {
  return isAdmin(user);
}
