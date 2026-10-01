"use client";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { adminClient } from "@/lib/adminClient";
import type { Course } from "@/lib/supabase";
import type { Notify } from "./AdminApp";
import { inp } from "./Upload";
import { DAYS, type Slot } from "../Timetable";

const empty = { day: 0, start_time: "08:30", end_time: "10:00", subject: "", room: "" };

export default function TimetableAdmin({ courses, notify }: { courses: Course[]; notify: Notify }) {
  const sb = adminClient();
  const [sem, setSem] = useState(1); const [sec, setSec] = useState("A");
  const [rows, setRows] = useState<Slot[]>([]);
  const [f, setF] = useState<any>(empty); const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await sb.from("timetable").select("*").eq("semester", sem).eq("section", sec).order("day").order("start_time");
    if (error) notify(error.message); else setRows((data as Slot[]) ?? []);
  };
  useEffect(() => { load(); }, [sem, sec]);

  async function save() {
    if (!f.subject.trim()) return notify("اختر المادة أو اكتب اسمها.");
    const payload = { semester: sem, section: sec, day: +f.day, start_time: f.start_time, end_time: f.end_time, subject: f.subject.trim(), room: f.room || null };
    const { error } = editId ? await sb.from("timetable").update(payload).eq("id", editId) : await sb.from("timetable").insert(payload);
    if (error) return notify("فشل الحفظ: " + error.message);
    notify(editId ? "تم التعديل" : "تمت الإضافة"); setF(empty); setEditId(null); load();
  }
  async function del(id: string) {
    if (!confirm("حذف هذه المحاضرة من الجدول؟")) return;
    const { error } = await sb.from("timetable").delete().eq("id", id);
    if (error) return notify(error.message); notify("تم الحذف"); load();
  }

  return (
    <section className="glass space-y-4 rounded-2xl p-5">
      <div className="grid grid-cols-2 gap-3">
        <select value={sem} onChange={(e) => setSem(+e.target.value)} className={inp}><option value={1}>الفصل الأول</option><option value={2}>الفصل الثاني</option></select>
        <select value={sec} onChange={(e) => setSec(e.target.value)} className={inp}><option>A</option><option>B</option></select>
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        <select value={f.day} onChange={(e) => setF({ ...f, day: e.target.value })} className={inp}>{DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select>
        <input dir="ltr" type="time" value={f.start_time} onChange={(e) => setF({ ...f, start_time: e.target.value })} className={inp} aria-label="البداية" />
        <input dir="ltr" type="time" value={f.end_time} onChange={(e) => setF({ ...f, end_time: e.target.value })} className={inp} aria-label="النهاية" />
        <input list="subjects" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="المادة" className={inp} />
        <input value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })} placeholder="القاعة" className={inp} />
        <datalist id="subjects">{courses.filter((c) => c.semester === sem).map((c) => <option key={c.id} value={c.title} />)}</datalist>
      </div>
      <div className="flex gap-2">
        <button onClick={save} className="rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white">{editId ? "حفظ التعديل" : "إضافة للجدول"}</button>
        {editId && <button onClick={() => { setEditId(null); setF(empty); }} className="glass rounded-xl px-4">إلغاء</button>}
      </div>
      <ul className="space-y-2">
        {rows.length === 0 && <li className="py-4 text-center opacity-60">لا توجد محاضرات في هذا الجدول.</li>}
        {rows.map((r) => (
          <li key={r.id} className="glass flex items-center gap-3 rounded-xl p-3 text-sm">
            <span className="w-20 font-bold">{DAYS[r.day]}</span>
            <span dir="ltr" className="w-28 opacity-70">{r.start_time} - {r.end_time}</span>
            <span className="flex-1 font-bold">{r.subject}{r.room && <span className="font-normal opacity-60"> - {r.room}</span>}</span>
            <button aria-label="تعديل" onClick={() => { setEditId(r.id); setF({ day: r.day, start_time: r.start_time, end_time: r.end_time, subject: r.subject, room: r.room ?? "" }); }}><Pencil className="h-4 w-4" /></button>
            <button aria-label="حذف" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-red-500" /></button>
          </li>))}
      </ul>
    </section>
  );
}
