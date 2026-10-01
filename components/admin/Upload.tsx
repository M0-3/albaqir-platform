"use client";
import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { adminClient } from "@/lib/adminClient";
import type { Course } from "@/lib/supabase";
import type { Notify } from "./AdminApp";

export const CATS: Record<string, string> = { lecture: "محاضرات نظرية", lab: "المختبر والعملي", summary: "ملخصات", exam_past: "أسئلة سابقة", exam_current: "أسئلة حالية" };
export const inp = "glass w-full rounded-xl p-2.5";

export async function uploadFile(courseId: string, f: File) {
  const ext = (f.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${courseId}/${crypto.randomUUID()}.${ext}`; // ASCII-safe key (Arabic filenames break storage keys)
  const { error } = await adminClient().storage.from("materials").upload(path, f, { contentType: f.type || undefined });
  if (error) throw error;
  return path;
}

export default function Upload({ courses, notify }: { courses: Course[]; notify: Notify }) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [course, setCourse] = useState(courses[0]?.id ?? "");
  const [cat, setCat] = useState("lecture");
  const [title, setTitle] = useState(""); const [no, setNo] = useState(""); const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null); const [code, setCode] = useState(""); const [lang, setLang] = useState("python");
  const [files, setFiles] = useState<File[]>([]); const [prog, setProg] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false); const [drag, setDrag] = useState(false);
  const sb = adminClient();
  const courseSelect = (
    <select value={course} onChange={(e) => setCourse(e.target.value)} className={inp}>
      {courses.map((c) => <option key={c.id} value={c.id}>{c.title} (ف{c.semester})</option>)}</select>);

  async function saveSingle() {
    if (!title.trim()) return notify("اكتب عنواناً للملف.");
    if (!file && !(cat === "lab" && code.trim())) return notify("اختر ملفاً (أو الصق كوداً في قسم العملي).");
    setBusy(true);
    try {
      const file_path = file ? await uploadFile(course, file) : null;
      const { error } = await sb.from("materials").insert({
        course_id: course, category: cat, title: title.trim(), lecture_no: no ? +no : null,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean), file_path,
        code: code.trim() || null, lang: code.trim() ? lang : null });
      if (error) throw error;
      notify("تم الرفع بنجاح"); setTitle(""); setNo(""); setTags(""); setFile(null); setCode("");
    } catch (e: any) { notify("فشل الرفع: " + e.message); }
    setBusy(false);
  }

  async function saveBulk() {
    setBusy(true);
    for (const f of files) {
      setProg((p) => ({ ...p, [f.name]: "جارٍ الرفع…" }));
      try {
        const file_path = await uploadFile(course, f);
        const { error } = await sb.from("materials").insert({ course_id: course, category: "summary", title: f.name.replace(/\.pdf$/i, ""), file_path });
        if (error) throw error;
        setProg((p) => ({ ...p, [f.name]: "تم ✓" }));
      } catch (e: any) { setProg((p) => ({ ...p, [f.name]: "فشل: " + e.message })); }
    }
    setBusy(false); setFiles([]); notify("انتهى الرفع الجماعي");
  }

  return (
    <section className="glass space-y-4 rounded-2xl p-5">
      <div className="flex gap-2">
        {([["single", "رفع مفصّل"], ["bulk", "رفع جماعي سريع"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} className={`glass rounded-full px-4 py-1.5 text-sm font-bold ${mode === k ? "ring-2 ring-indigo-500" : ""}`}>{l}</button>))}
      </div>
      <label className="block text-sm">المادة{courseSelect}</label>

      {mode === "single" ? (<>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">القسم<select value={cat} onChange={(e) => setCat(e.target.value)} className={inp}>
            {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label className="text-sm">رقم المحاضرة (اختياري)<input type="number" value={no} onChange={(e) => setNo(e.target.value)} className={inp} /></label>
        </div>
        <label className="block text-sm">العنوان<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="المحاضرة 1 - Introduction to AI" className={inp} /></label>
        <label className="block text-sm">ملاحظات / وسوم (مفصولة بفاصلة)<input value={tags} onChange={(e) => setTags(e.target.value)} className={inp} /></label>
        <label className="block text-sm">الملف (PDF أو صورة)<input type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className={inp} /></label>
        {cat === "lab" && (<div className="space-y-2">
          <input dir="ltr" value={lang} onChange={(e) => setLang(e.target.value)} placeholder="python" className={inp} />
          <textarea dir="ltr" rows={8} value={code} onChange={(e) => setCode(e.target.value)} placeholder="الصق الكود هنا" className={inp + " font-mono text-sm"} /></div>)}
        <button disabled={busy} onClick={saveSingle} className="rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white disabled:opacity-50">{busy ? "جارٍ الرفع…" : "رفع"}</button>
      </>) : (<>
        <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); setFiles([...files, ...Array.from(e.dataTransfer.files).filter((f) => f.type === "application/pdf")]); }}
          className={`grid place-items-center rounded-2xl border-2 border-dashed p-10 text-center ${drag ? "border-indigo-500 bg-indigo-500/10" : "border-[var(--line)]"}`}>
          <UploadCloud className="mb-2 h-8 w-8 opacity-60" />
          <p>اسحب ملفات PDF وأفلتها هنا، أو</p>
          <input type="file" multiple accept=".pdf" className="mt-2 text-sm"
            onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? [])])} />
        </div>
        <ul className="space-y-1 text-sm">{files.map((f) => <li key={f.name} className="flex justify-between"><span>{f.name}</span><span className="opacity-70">{prog[f.name]}</span></li>)}</ul>
        <button disabled={busy || !files.length} onClick={saveBulk} className="rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white disabled:opacity-50">
          {busy ? "جارٍ الرفع…" : `نشر ${files.length || ""} ملف في الملخصات`}</button>
      </>)}
    </section>
  );
}
