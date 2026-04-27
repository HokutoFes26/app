const SECRET_KEY = process.env.NEXT_PUBLIC_QR_AUTH_KEY || "hokuto-fes-secret-2026";

async function generateToken(id: string, timeStep: number): Promise<string> {
  const msg = `${id}-${SECRET_KEY}-${Math.floor(timeStep)}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(msg);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, 12);
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
