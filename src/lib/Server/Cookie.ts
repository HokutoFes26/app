export function getCookie(key: string): string {
  if (typeof document === "undefined") return "";
  const cookies: string[] = document.cookie.split(";");
  const foundCookie: string | undefined = cookies.find((cookie) => cookie.split("=")[0].trim() === key.trim());
  if (foundCookie) {
    return decodeURIComponent(foundCookie.split("=")[1]);
  }
  return "";
}

export function setCookie(key: string, value: string | number | boolean, days: number = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${key}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export const postCookie = setCookie;
