"use client";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { adminClient } from "@/lib/adminClient";
import type { Course } from "@/lib/supabase";
import Upload from "./Upload";
import Manage from "./Manage";
import TimetableAdmin from "./TimetableAdmin";

const TABS = [
  ["upload", "رفع محتوى"],
  ["manage", "إدارة المحتوى"],
  ["news", "الإعلانات"],
  ["timetable", "الجدول"],
  ["settings", "الإعدادات"]
] as const;

export type Notify = (m: string) => void;

export default function AdminApp() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<string>("upload");
  const [courses, setCourses] = useState<Course[]>([]);
  const [live, setLive] = useState(false);
  const [msg, setMsg] = useState("");
  const notify: Notify = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3500); };

  useEffect(() => {
    const sb = adminClient();
    sb.auth.getSession().then(async ({ data }) => {
      if (!data.session) return location.replace("/admin/login");
      const [c, s] = await Promise.all([
        sb.from("courses").select("*").order("semester").order("sort"),
        sb.from("settings").select("value").eq("key", "semester2_live").single(),
      ]);
      setCourses((c.data as Course[]) ?? []); 
      setLive(s.data?.value === true); 
      setReady(true);
    });

    const { data: sub } = sb.auth.onAuthStateChange((e) => e === "SIGNED_OUT" && location.replace("/admin/login"));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function toggle() {
    const sb = adminClient();
    const next = !live;
    const { error } = await sb.from("settings").upsert({ key: "semester2_live", value: next });
    if (error) return notify("تعذّر تحديث الإعداد: " + error.message);
    setLive(next); 
    notify(next ? "تم تفعيل وضع الفصل الثاني" : "تم تعطيل وضع الفصل الثاني");
  }

  async function handleSignOut() {
    const sb = adminClient();
    await sb.auth.signOut();
  }

  if (!ready) return <p className="p-8">جارٍ التحقق من الجلسة…</p>;

  return (
    <main className="mx-auto max-w-5xl space-y-5 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">لوحة المشرف</h1>
        <button onClick={handleSignOut} className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm">
          <LogOut className="h-4 w-4" /> خروج
        </button>
      </div>

      <div className="glass flex gap-1 overflow-x-auto rounded-full p-1" role="tablist">
        {TABS.map(([k, l]) => (
          <button 
            key={k} 
            role="tab" 
            aria-selected={tab === k} 
            onClick={() => setTab(k)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${tab === k ? "bg-indigo-600 text-white" : ""}`}
          >
            {l}
          </button>
        ))}
      </div>

      {msg && <p role="status" className="glass rounded-xl p-3 text-sm">{msg}</p>}

      {tab === "upload" && <Upload courses={courses} notify={notify} />}
      {tab === "manage" && <Manage mode="materials" courses={courses} notify={notify} />}
      {tab === "news" && <Manage mode="news" courses={courses} notify={notify} />}
      {tab === "timetable" && <TimetableAdmin courses={courses} notify={notify} />}
      {tab === "settings" && (
        <section className="glass flex items-center justify-between gap-4 rounded-2xl p-5">
          <div>
            <h2 className="font-bold">Enable Semester 2 Live Mode</h2>
            <p className="text-sm opacity-70">عند التعطيل تظهر رسالة «لا يوجد شيء حالياً» عند فتح أي مادة من الفصل الثاني.</p>
          </div>
          <button 
            role="switch" 
            aria-checked={live} 
            onClick={toggle}
            className={`relative h-8 w-14 shrink-0 rounded-full transition ${live ? "bg-emerald-500" : "bg-slate-400"}`}
          >
            <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${live ? "right-1" : "right-7"}`} />
          </button>
        </section>
      )}
    </main>
  );
}