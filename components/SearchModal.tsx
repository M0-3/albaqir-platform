"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { supabase, type Course } from "@/lib/supabase";

type Mat = { id: string; course_id: string; category: string; title: string; code?: string | null };
const CAT: Record<string, string> = { lecture: "محاضرة", lab: "عملي", summary: "ملخص", exam_past: "أسئلة سابقة", exam_current: "أسئلة حالية" };
const norm = (s: string) => s.toLowerCase().replace(/[\u064B-\u0652\u0640]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [mats, setMats] = useState<Mat[]>([]);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    supabase.from("courses").select("*").then((r) => setCourses((r.data as Course[]) ?? []));
    supabase.from("materials").select("id,course_id,category,title,code").then((r) => setMats((r.data as Mat[]) ?? []));
    return () => removeEventListener("keydown", k);
  }, []);

  const res = useMemo(() => {
    const n = norm(q.trim()); if (!n) return [];
    const name = (id: string) => courses.find((c) => c.id === id)?.title ?? "";
    const a = courses.filter((c) => norm(c.title).includes(n)).map((c) => ({ key: c.id, title: c.title, sub: "مادة", href: `/course/${c.id}` }));
    const b = mats.filter((m) => norm(m.title).includes(n) || (m.code && norm(m.code).includes(n)))
      .map((m) => ({ key: m.id, title: m.title, sub: `${CAT[m.category]} - ${name(m.course_id)}`, href: `/course/${m.course_id}?tab=${m.category}` }));
    return [...a, ...b].slice(0, 20);
  }, [q, courses, mats]);

  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-50 bg-black/50 p-4 pt-[12vh]" onClick={onClose}>
      <div className="glass mx-auto max-w-xl rounded-2xl bg-[var(--bg)] p-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-2">
          <Search className="h-5 w-5 opacity-60" />
          <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن مادة، محاضرة، كود أو سنة امتحان…"
            className="w-full bg-transparent p-2 outline-none" />
          <button aria-label="إغلاق" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <ul className="mt-2 max-h-[50vh] overflow-y-auto">
          {q && res.length === 0 && <li className="p-4 text-center opacity-60">لا توجد نتائج لـ «{q}»</li>}
          {res.map((r) => (
            <li key={r.key}><a href={r.href} className="block rounded-xl p-3 hover:bg-indigo-600/15">
              <div className="font-bold">{r.title}</div><div className="text-xs opacity-60">{r.sub}</div></a></li>))}
        </ul>
      </div>
    </div>
  );
}
