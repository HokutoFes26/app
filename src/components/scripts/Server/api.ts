import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

export const fetchSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Session fetch error:", error);
        return null;
    }
    return data.session;
};
