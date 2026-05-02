import { supabase } from "@/lib/Server/supabase";
import { performMutation } from "@/lib/Server/baseApi";

export const postNews = async (title: string, content: string) => {
  return performMutation(async () => {
    console.log("[API] Update Sent: New News");
    const { error } = await supabase.from("news").insert([{ title, content }]);
    if (error) throw error;
    return { success: true };
  });
};

export const updateNews = async (id: string, updates: { title: string; content: string; reason: string }) => {
  return performMutation(async () => {
    console.log(`[API] Update Sent: Edit News (${id})`);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const { error } = await supabase
      .from("news")
      .update({
        title: updates.title,
        content: updates.content,
        edit_reason: `${updates.reason} (${timeStr})`,
      })
      .eq("id", id);
    if (error) throw error;
    return { success: true };
  });
};

export const deleteNews = async (id: string) => {
  return performMutation(async () => {
    console.log(`[API] Update Sent: Delete News (${id})`);
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  });
};
