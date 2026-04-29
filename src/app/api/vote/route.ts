import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_VOTES_PER_WINDOW = 5;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];
    const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    
    if (validTimestamps.length >= MAX_VOTES_PER_WINDOW) {
      console.warn(`[Vote API] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: "投票のリクエストが多すぎます。しばらく待ってから再度お試しください。" },
        { status: 429 }
      );
    }
    
    validTimestamps.push(now);
    rateLimitMap.set(ip, validTimestamps);
    if (rateLimitMap.size > 10000) rateLimitMap.clear();

    const body = await req.json();
    const { targetId, category, voterId } = body;

    if (!targetId || !category || !voterId) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }

    const { error } = await supabase.rpc("vote_for_target", {
      p_voter_id: voterId,
      p_target_id: targetId,
      p_category: category,
    });

    if (error) {
      console.error("[Vote API] Supabase RPC Error:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Vote API] Internal Error:", error);
    return NextResponse.json({ error: error.message || "サーバーエラーが発生しました" }, { status: 500 });
  }
}
