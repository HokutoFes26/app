import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runVulnerabilityAudit() {
    console.log("-- Attack test begin --");

    console.log("\n[T1] Voting outside of set hours");
    const { error: voteErr } = await supabase.rpc("vote_for_target", {
        p_voter_id: "audit-attacker-" + Math.random(),
        p_target_id: "01",
        p_category: "s",
    });

    if (!voteErr) {
        console.warn("T1: Attack successful");
    } else {
        console.log("T1: Attack failed");
    }

    console.log("\n[T2] RLS");
    const { error: newsErr } = await supabase
        .from("news")
        .insert([{ title: "News by Booth admin", content: "Booth admin can send news." }]);

    if (!newsErr) {
        console.warn("T2: Attack successful");
    } else if (newsErr.code === "42501") {
        console.log("T2: Attack failed");
    }

    console.log("\n[T3] Fake voter ID");
    let successCount = 0;
    for (let i = 0; i < 5; i++) {
        const { error } = await supabase.rpc("vote_for_target", {
            p_voter_id: `spoof-id-${i}`,
            p_target_id: "01",
            p_category: "s",
        });
        if (!error) successCount++;
    }

    if (successCount >= 5) {
        console.warn("T3: Attack successful");
    } else {
        console.log(`T3: Attack failed`);
    }

    console.log("\n[T4] Invalid RPC");
    const {
        data,
        error: castErr,
        count,
    } = await supabase.from("app_settings").update({ value_text: "not-a-date" }).eq("key", "vote_start_at").select();
    if (castErr || (data && data.length === 0)) {
        console.log("T4: Attack failed");
    } else {
        console.warn("T4: Attack successful");
    }
}

runVulnerabilityAudit();
