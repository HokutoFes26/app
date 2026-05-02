const SECRET_KEY = process.env.NEXT_PUBLIC_QR_AUTH_KEY || "";

async function generateToken(id: string, timeStep: number): Promise<string> {
  const msg = `${id}-${SECRET_KEY}-${Math.floor(timeStep)}`;
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(msg);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .substring(0, 12);
  }

  let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0;
  for (let i = 0, ch; i < msg.length; i++) {
    ch = msg.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const fallbackHash = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  return fallbackHash.padStart(12, "0").substring(0, 12);
}

export async function generateHandoffUrl(baseUrl: string, id: string): Promise<string> {
  const step = Date.now() / (1000 * 60 * 5);
  const token = await generateToken(id, step);
  return `${baseUrl}?id=${id}&token=${token}`;
}

export async function verifyToken(id: string, providedToken: string): Promise<boolean> {
  if (!providedToken) return false;
  const currentStep = Date.now() / (1000 * 60 * 5);
  const [tokenNow, tokenPrev] = await Promise.all([generateToken(id, currentStep), generateToken(id, currentStep - 1)]);
  return providedToken === tokenNow || providedToken === tokenPrev;
}
