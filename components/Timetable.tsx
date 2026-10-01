"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileDown, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
export type Slot = { id: string; semester: number; section: string; day: number; start_time: string; end_time: string; subject: string; room: string | null };

export default function Timetable() {
  const [sem, setSem] = useState<1 | 2>(1);
  const [sec, setSec] = useState<"A" | "B">("A");
  const [rows, setRows] = useState<Slot[]>([]);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("timetable").select("*").eq("semester", sem).eq("section", sec).order("start_time")
      .then((r) => setRows((r.data as Slot[]) ?? []));
  }, [sem, sec]);

  const name = `جدول-الفصل-${sem}-شعبة-${sec}`;
  async function exportAs(kind: "png" | "pdf") {
    if (!ref.current) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      const bg = getComputedStyle(document.body).backgroundColor;
      const url = await toPng(ref.current, { pixelRatio: 3, backgroundColor: bg });
      if (kind === "png") { const a = document.createElement("a"); a.href = url; a.download = name + ".png"; a.click(); }
      else {
        const { jsPDF } = await import("jspdf");
        const w = ref.current.offsetWidth, h = ref.current.offsetHeight;
        const pdf = new jsPDF({ orientation: w > h ? "l" : "p", unit: "px", format: [w, h] });
        pdf.addImage(url, "PNG", 0, 0, w, h); pdf.save(name + ".pdf");
      }
    } finally { setBusy(false); }
  }

  const Pill = ({ items, val, set }: { items: [string | number, string][]; val: any; set: (v: any) => void }) => (
    <div className="glass inline-flex rounded-full p-1" role="tablist">
      {items.map(([k, l]) => (
        <button key={k} role="tab" aria-selected={val === k} onClick={() => set(k)} className="relative rounded-full px-5 py-2 text-sm font-bold">
          {val === k && <motion.span layoutId={"p" + items[0][1]} className="absolute inset-0 -z-10 rounded-full bg-indigo-600/90" />}
          <span className={val === k ? "text-white" : ""}>{l}</span></button>))}
    </div>);

  return (
    <main className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
      <h1 className="text-3xl font-extrabold">الجدول الأسبوعي</h1>
      <div className="flex flex-wrap items-center gap-3">
        <Pill items={[[1, "الفصل الدراسي الأول"], [2, "الفصل الدراسي الثاني"]]} val={sem} set={setSem} />
        <Pill items={[["A", "الشعبة A"], ["B", "الشعبة B"]]} val={sec} set={setSec} />
        <div className="mr-auto flex gap-2">
          <button disabled={busy} onClick={() => exportAs("png")} className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold disabled:opacity-50"><Download className="h-4 w-4" />صورة</button>
          <button disabled={busy} onClick={() => exportAs("pdf")} className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold disabled:opacity-50"><FileDown className="h-4 w-4" />PDF</button>
        </div>
      </div>

      <div ref={ref} className="space-y-4 rounded-3xl p-4">
        <h2 className="text-lg font-bold">منصة الباقر - الفصل {sem === 1 ? "الأول" : "الثاني"} - الشعبة {sec}</h2>
        {rows.length === 0 ? <p className="glass rounded-2xl p-8 text-center opacity-70">لم يُضف جدول لهذه الشعبة بعد.</p> :
          <div className="grid gap-3 md:grid-cols-5">
            {DAYS.map((d, i) => (
              <section key={d} className="space-y-2">
                <h3 className="rounded-xl bg-indigo-600 py-2 text-center text-sm font-bold text-white">{d}</h3>
                {rows.filter((r) => r.day === i).map((r) => (
                  <article key={r.id} className="glass rounded-xl p-3">
                    <div dir="ltr" className="text-xs font-bold text-indigo-500">{r.start_time} - {r.end_time}</div>
                    <div className="mt-1 font-bold leading-snug">{r.subject}</div>
                    {r.room && <div className="mt-1 flex items-center gap-1 text-xs opacity-70"><MapPin className="h-3 w-3" />{r.room}</div>}
                  </article>))}
                {rows.every((r) => r.day !== i) && <p className="py-3 text-center text-xs opacity-40">لا محاضرات</p>}
              </section>))}
          </div>}
      </div>
    </main>
  );
}
