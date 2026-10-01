import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export type Course = { id: string; title: string; semester: 1 | 2; sort: number };
export type Material = {
  id: string; course_id: string; category: string; title: string;
  lecture_no: number | null; file_path: string | null; created_at: string;
};
export const fileUrl = (p: string) =>
  supabase.storage.from("materials").getPublicUrl(p).data.publicUrl;
