import { supabase } from "@/lib/Server/supabase";

let loginPromise: Promise<any> | null = null;

export const loginAsAdmin = async (password: string) => {
  const email = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!email) throw new Error("Admin email is not configured");
  
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user.email === email) {
    console.log("[API] Auth: Already logged in as Admin");
    return { user: sessionData.session.user };
  }
  
  if (loginPromise) return loginPromise;
  
  console.log("[API] Auth: Admin Login Attempt");
  loginPromise = supabase.auth
    .signInWithPassword({ email, password })
    .then((res) => {
      loginPromise = null;
      if (res.error) throw res.error;
      return res.data;
    })
    .catch((err) => {
      loginPromise = null;
      throw err;
    });
  return loginPromise;
};

export const loginAsStallAdmin = async (password?: string) => {
  const email = process.env.NEXT_PUBLIC_BOOTH_ADMIN_EMAIL;
  const defaultPassword = process.env.NEXT_PUBLIC_BOOTH_ADMIN_PASSWORD;
  const pass = password || defaultPassword;

  if (!email) throw new Error("Booth admin email is not configured");
  if (!pass) throw new Error("Booth admin password is not configured");

  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user.email === email) {
    console.log("[API] Auth: Already logged in as Booth Admin");
    return { user: sessionData.session.user };
  }
  
  if (loginPromise) return loginPromise;
  
  console.log("[API] Auth: Booth Admin Login Attempt");
  loginPromise = supabase.auth
    .signInWithPassword({ email, password: pass })
    .then((res) => {
      loginPromise = null;
      if (res.error) throw res.error;
      return res.data;
    })
    .catch((err) => {
      loginPromise = null;
      throw err;
    });
  return loginPromise;
};

export const fetchSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Session fetch error:", error);
    return null;
  }
  return data.session;
};
