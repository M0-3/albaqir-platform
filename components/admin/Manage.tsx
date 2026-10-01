"use client";
import { useEffect, useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { adminClient } from "@/lib/adminClient";
import { fileUrl, type Course } from "@/lib/supabase";
import type { Notify } from "./AdminApp";
import { CATS, inp } from "./Upload";

type Row = { id: string; title?: string; body?: string; category?: string; course_id?: string; lecture_no?: number | null; file_path?: string | null; created_at: string };

export default function Manage({ mode, courses, notify }: { mode: "materials" | "news"; courses: Course[]; notify: Notify }) {
  const sb = adminClient();
  const table = mode === "materials" ? "materials" : "announcements";
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState("");
  const [edit, setEdit] = useState<Row | null>(null);
  const [fresh, setFresh] = useState("");

  const load = async () => {
    let q = sb.from(table).select("*").order("created_at", { ascending: false });
    if (mode === "materials" && filter) q = q.eq("course_id", filter);
    const { data, error } = await q;
    if (error) notify(error.message); else setRows((data as Row[]) ?? []);
  };
  useEffect(() => { load(); }, [mode, filter]);

  async function save() {
    if (!edit) return;
    const patch = mode === "materials"
      ? { title: edit.title, category: edit.category, lecture_no: edit.lecture_no || null }
      : { body: edit.body };
    const { error } = await sb.from(table).update(patch).eq("id", edit.id);
    if (error) return notify("فشل الحفظ: " + error.message);
    setEdit(null); notify("تم الحفظ"); load();
  }

  async function del(r: Row) {
    if (!confirm("هل تريد الحذف نهائياً؟")) return;
    if (r.file_path) await sb.storage.from("materials").remove([r.file_path]);
    const { error } = await sb.from(table).delete().eq("id", r.id);
    if (error) return notify("فشل الحذف: " + error.message);
    notify("تم الحذف"); load();
  }

  async function addNews() {
    if (!fresh.trim()) return;
    const { error } = await sb.from("announcements").insert({ body: fresh.trim() });
    if (error) return notify(error.message);
    setFresh(""); notify("تم نشر الإعلان"); load();
  }

  const cname = (id?: string) => courses.find((c) => c.id === id)?.title ?? "";
  return (
    <section className="glass space-y-3 rounded-2xl p-5">
      {mode === "materials" ? (
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className={inp}>
          <option value="">كل المواد</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
      ) : (
        <div className="flex gap-2"><input value={fresh} onChange={(e) => setFresh(e.target.value)} placeholder="نص الإعلان الجديد" className={inp} />
          <button onClick={addNews} className="shrink-0 rounded-xl bg-indigo-600 px-5 font-bold text-white">نشر</button></div>)}

      {rows.length === 0 && <p className="py-6 text-center opacity-60">لا يوجد محتوى بعد.</p>}
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="glass flex flex-wrap items-center gap-2 rounded-xl p-3">
            {edit?.id === r.id ? (<>
              {mode === "materials" ? (<>
                <input value={edit.title ?? ""} onChange={(e) => setEdit({ ...edit, title: e.target.value })} className={inp + " flex-1"} />
                <select value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} className={inp + " w-auto"}>
                  {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                <input type="number" value={edit.lecture_no ?? ""} onChange={(e) => setEdit({ ...edit, lecture_no: e.target.value ? +e.target.value : null })} placeholder="رقم" className={inp + " w-20"} />
              </>) : <input value={edit.body ?? ""} onChange={(e) => setEdit({ ...edit, body: e.target.value })} className={inp + " flex-1"} />}
              <button aria-label="حفظ" onClick={save}><Check className="h-5 w-5 text-emerald-500" /></button>
              <button aria-label="إلغاء" onClick={() => setEdit(null)}><X className="h-5 w-5" /></button>
            </>) : (<>
              <div className="min-w-0 flex-1">
                {r.file_path ? <a href={fileUrl(r.file_path)} target="_blank" className="font-bold underline-offset-2 hover:underline">{r.title}</a>
                  : <span className="font-bold">{r.title ?? r.body}</span>}
                {mode === "materials" && <div className="text-xs opacity-60">{CATS[r.category!]} - {cname(r.course_id)}</div>}
              </div>
              <button aria-label="تعديل" onClick={() => setEdit(r)}><Pencil className="h-4 w-4" /></button>
              <button aria-label="حذف" onClick={() => del(r)}><Trash2 className="h-4 w-4 text-red-500" /></button>
            </>)}
          </li>))}
      </ul>
    </section>
  );
}
