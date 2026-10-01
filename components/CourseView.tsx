"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Image as ImageIcon } from "lucide-react";
import { supabase, fileUrl, type Course, type Material } from "@/lib/supabase";
import CodeBlock from "./CodeBlock";
import Lightbox, { type Item } from "./Lightbox";

type M = Material & { code?: string | null; lang?: string | null };
const TABS = [
  { k: "lecture", label: "المحاضرات النظرية" },
  { k: "lab", label: "المختبر والعملي" },
  { k: "summary", label: "الملخصات" },
  { k: "exams", label: "بنك الأسئلة" },
] as const;

export default function CourseView({ id }: { id: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [items, setItems] = useState<M[]>([]);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("lecture");
  const [examSub, setExamSub] = useState<"exam_past" | "exam_current">("exam_past");
  const [sel, setSel] = useState<string | null>(null);
  const [lb, setLb] = useState<{ items: Item[]; i: number } | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(location.search).get("tab");
    if (t) setTab(t.startsWith("exam") ? "exams" : t);
    (async () => {
      const [c, m, s] = await Promise.all([
        supabase.from("courses").select("*").eq("id", id).single(),
        supabase.from("materials").select("*").eq("course_id", id).order("lecture_no").order("created_at", { ascending: false }),
        supabase.from("settings").select("value").eq("key", "semester2_live").single(),
      ]);
      const c2 = c.data as Course | null;
      setCourse(c2); setItems((m.data as M[]) ?? []);
      setBlocked(c2?.semester === 2 && s.data?.value !== true);
      setLoading(false);
    })();
  }, [id]);

  const of = (cat: string) => items.filter((x) => x.category === cat);
  const counts: Record<string, number> = useMemo(() => ({
    lecture: of("lecture").length, lab: of("lab").length, summary: of("summary").length,
    exams: of("exam_past").length + of("exam_current").length,
  }), [items]);

  if (loading) return <p className="p-8">جارٍ التحميل…</p>;
  if (!course) return <main className="grid min-h-[60vh] place-items-center text-center"><div><p className="text-2xl font-extrabold">المادة غير موجودة</p><a href="/" className="mt-3 inline-block underline">العودة للرئيسية</a></div></main>;
  if (blocked)
    return <main className="grid min-h-[60vh] place-items-center text-center">
      <div><p className="text-2xl font-extrabold">لا يوجد شيء حالياً</p>
      <p className="mt-2 opacity-80">(شبيك مستعجل خلص الكورس الأول أول شي 😂)</p></div></main>;

  const lectures = of("lecture");
  const active = lectures.find((l) => l.id === sel) ?? lectures[0];
  const openLb = (list: M[], i: number) =>
    setLb({ items: list.filter((x) => x.file_path).map((x) => ({ url: fileUrl(x.file_path!), title: x.title })), i });

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <h1 className="text-3xl font-extrabold">{course.title}</h1>

      {/* Bento overview: each tile jumps to its tab */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {TABS.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)} className="glass rounded-2xl p-4 text-right">
            <div className="text-3xl font-extrabold">{counts[t.k]}</div>
            <div className="text-sm opacity-70">{t.label}</div>
          </button>
        ))}
      </div>

      <div className="glass relative flex overflow-x-auto rounded-full p-1" role="tablist">
        {TABS.map((t) => (
          <button key={t.k} role="tab" aria-selected={tab === t.k} onClick={() => setTab(t.k)}
            className="relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold">
            {tab === t.k && <motion.span layoutId="ctab" className="absolute inset-0 -z-10 rounded-full bg-indigo-600/90" />}
            <span className={tab === t.k ? "text-white" : ""}>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "lecture" && (lectures.length === 0 ? <Empty /> :
        <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
          <ul className="glass space-y-1 rounded-2xl p-2">
            {lectures.map((l) => (
              <li key={l.id}><button onClick={() => setSel(l.id)}
                className={`w-full rounded-xl p-3 text-right text-sm ${active?.id === l.id ? "bg-indigo-600/20 font-bold" : ""}`}>
                {l.title}</button></li>
            ))}
          </ul>
          {active?.file_path && <iframe key={active.id} src={fileUrl(active.file_path)} title={active.title}
            className="glass h-[75vh] w-full rounded-2xl bg-white" />}
        </div>)}

      {tab === "lab" && (of("lab").length === 0 ? <Empty /> :
        <div className="space-y-6">
          {of("lab").map((l) => (
            <section key={l.id} className="space-y-2">
              <h3 className="font-bold">{l.title}</h3>
              {l.code && <CodeBlock code={l.code} lang={l.lang} />}
              {l.file_path && <a href={fileUrl(l.file_path)} target="_blank" className="glass inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm">
                <FileText className="h-4 w-4" />فتح الملف</a>}
            </section>))}
        </div>)}

      {tab === "summary" && (of("summary").length === 0 ? <Empty /> :
        <div className="grid gap-3 md:grid-cols-2">
          {of("summary").map((s) => (
            <a key={s.id} href={s.file_path ? fileUrl(s.file_path) : "#"} download target="_blank"
              className="glass flex items-center gap-3 rounded-xl p-4">
              <Download className="h-5 w-5" /><span className="flex-1">{s.title}</span></a>))}
        </div>)}

      {tab === "exams" && (<>
        <div className="flex gap-2">
          {([["exam_past", "أسئلة سابقة"], ["exam_current", "أسئلة حالية"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setExamSub(k)}
              className={`glass rounded-full px-4 py-1.5 text-sm font-bold ${examSub === k ? "ring-2 ring-indigo-500" : ""}`}>{l}</button>))}
        </div>
        {of(examSub).length === 0 ? <Empty /> :
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {of(examSub).map((x, i) => {
              const img = x.file_path && /\.(png|jpe?g|webp|gif)$/i.test(x.file_path);
              return (
                <button key={x.id} onClick={() => openLb(of(examSub), i)}
                  className="glass overflow-hidden rounded-2xl text-right">
                  {img ? <img src={fileUrl(x.file_path!)} alt={x.title} loading="lazy" className="h-36 w-full object-cover" />
                    : <div className="grid h-36 place-items-center"><ImageIcon className="h-8 w-8 opacity-50" /></div>}
                  <div className="p-3 text-sm font-bold">{x.title}</div>
                </button>);
            })}
          </div>}
      </>)}

      {lb && <Lightbox items={lb.items} index={lb.i} onIndex={(i) => setLb({ ...lb, i })} onClose={() => setLb(null)} />}
    </main>
  );
}
const Empty = () => <p className="glass rounded-2xl p-8 text-center opacity-70">لم يتم رفع محتوى في هذا القسم بعد.</p>;
