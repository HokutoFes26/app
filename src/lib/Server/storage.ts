import { supabase } from "@/lib/Server/supabase";

export const uploadImage = async (file: File, bucket: string = "lost-items") => {
  const fileName = `${Math.random().toString(36).substring(2)}.jpg`;
  const filePath = `${fileName}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);

  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return { path: filePath, publicUrl: data.publicUrl };
};

export const getPublicUrl = (path: string, bucket: string = "lost-items") => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const deleteImage = async (path: string, bucket: string = "lost-items") => {
  const cleanPath = path.trim().replace(/^\/+/, "");
  const { data, error } = await supabase.storage.from(bucket).remove([cleanPath]);

  if (error) throw error;
  return data;
};
