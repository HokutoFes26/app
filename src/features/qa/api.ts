import { supabase } from "@/lib/Server/supabase";
import { performMutation } from "@/lib/Server/baseApi";

export const askQuestion = async (text: string) => {
  return performMutation(async () => {
    console.log("[API] Update Sent: New Question");
    const { error } = await supabase.from("questions").insert([{ text }]);
    if (error) throw error;
    return { success: true };
  });
};

export const replyToQuestion = async (id: string, answer: string, reason?: string) => {
  return performMutation(async () => {
    console.log(`[API] Update Sent: Reply/Edit Question (${id})`);
    const updates: { answer: string; edit_reason?: string } = { answer };
    if (reason && reason.trim() !== "") {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      updates.edit_reason = `${reason} (${timeStr})`;
    }
    const { error } = await supabase.from("questions").update(updates).eq("id", id);
    if (error) throw error;
    return { success: true };
  });
};

export const deleteQuestion = async (id: string) => {
  return performMutation(async () => {
    console.log(`[API] Update Sent: Delete Question (${id})`);
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  });
};
