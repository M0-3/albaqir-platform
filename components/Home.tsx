"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Instagram, Send, FileText, X, Megaphone } from "lucide-react";
import { supabase, fileUrl, type Course, type Material } from "@/lib/supabase";

export default function Home() {
  const [sem, setSem] = useState<1 | 2>(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [live2, setLive2] = useState(false);
  const [recent, setRecent] = useState<Material[]>([]);
  const [news, setNews] = useState<{ id: string; body: string }[]>([]);
  const [egg, setEgg] = useState(false);

  useEffect(() => {
    (async () => {
      const [c, s, m, a] = await Promise.all([
        supabase.from("courses").select("*").order("sort"),
        supabase.from("settings").select("value").eq("key", "semester2_live").single(),
        supabase.from("materials").select("*").order("created_at", { ascending: false }).limit(6),
        supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(3),
      ]);
      setCourses((c.data as Course[]) ?? []);
      setLive2(s.data?.value === true);
      setRecent((m.data as Material[]) ?? []);
      setNews(a.data ?? []);
    })();
  }, []);

  const open = (c: Course) => {
    if (c.semester === 2 && !live2) return setEgg(true);
    location.href = `/course/${c.id}`;
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <section className="glass rounded-3xl p-6 md:p-12">
        <h1 className="text-2xl font-extrabold leading-relaxed md:text-4xl">
          أهلاً بكم في منصة الباقر الأكاديمية - دليلكم الشامل ومستودعكم الأكاديمي لمواد المرحلة الثالثة
        </h1>
        <p className="mt-3 max-w-2xl opacity-80">
          محاضرات، مختبرات، ملخصات وبنك أسئلة لكل مواد المرحلة الثالثة في مكان واحد.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="https://t.me/svoo3" className="glass flex items-center gap-2 rounded-full px-5 py-2.5 shadow-[0_0_24px_#0088cc55]">
            <Send className="h-5 w-5" style={{ color: "#0088cc" }} />
            <span className="font-bold" style={{ color: "#0088cc" }}>الباقر</span>
          </a>
          <a href="https://www.instagram.com/2i.ce?stkn=aGlzdWd1czQ3cjMx" className="glass flex items-center gap-2 rounded-full px-5 py-2.5 shadow-[0_0_24px_#e1306c55]">
            <Instagram className="h-5 w-5" style={{ color: "#e1306c" }} />
            <span className="font-bold" style={{ color: "#e1306c" }}>الباقر</span>
          </a>
        </div>
      </section>

      {news.length > 0 && (
        <section className="glass rounded-2xl p-4">
          {news.map((n) => (
            <p key={n.id} className="flex items-center gap-2 py-1"><Megaphone className="h-4 w-4 shrink-0" />{n.body}</p>
          ))}
        </section>
      )}

      <div className="glass relative inline-flex rounded-full p-1" role="tablist">
        {([1, 2] as const).map((n) => (
          <button key={n} role="tab" aria-selected={sem === n} onClick={() => setSem(n)}
            className="relative z-10 rounded-full px-5 py-2 text-sm font-bold">
            {sem === n && <motion.span layoutId="pill" className="absolute inset-0 -z-10 rounded-full bg-indigo-600/90" />}
            <span className={sem === n ? "text-white" : ""}>{n === 1 ? "الفصل الدراسي الأول" : "الفصل الدراسي الثاني"}</span>
          </button>
        ))}
      </div>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-6">
        {courses.filter((c) => c.semester === sem).map((c, i) => (
          <button key={c.id} onClick={() => open(c)}
            className={`glass rounded-2xl p-5 text-right text-lg font-bold transition hover:-translate-y-1 md:col-span-2 ${i === 0 ? "col-span-2 md:col-span-3 md:row-span-2 md:text-2xl" : ""}`}>
            {c.title}
          </button>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">آخر المرفقات</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {recent.length === 0 && <p className="opacity-60">لم يتم رفع أي مرفقات بعد.</p>}
          {recent.map((m) => (
            <a key={m.id} href={m.file_path ? fileUrl(m.file_path) : "#"} target="_blank"
              className="glass flex items-center gap-3 rounded-xl p-3">
              <FileText className="h-5 w-5" />
              <span className="flex-1">{m.title}</span>
              <time className="text-xs opacity-60">{new Date(m.created_at).toLocaleDateString("ar-IQ")}</time>
            </a>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {egg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setEgg(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              role="dialog" aria-modal className="glass relative w-full max-w-sm rounded-3xl p-8 text-center"
              onClick={(e) => e.stopPropagation()}>
              <button aria-label="إغلاق" onClick={() => setEgg(false)} className="absolute left-4 top-4"><X /></button>
              <p className="text-2xl font-extrabold">لا يوجد شيء حالياً</p>
              <p className="mt-2 opacity-80">(شبيك مستعجل خلص الكورس الأول أول شي 😂)</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
