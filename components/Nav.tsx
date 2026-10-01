"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import SearchModal from "./SearchModal";

const LINKS = [{ href: "/", label: "الرئيسية" }, { href: "/timetable", label: "الجدول الأسبوعي" }];

export default function Nav() {
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch((s) => !s); }
    };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, []);
  useEffect(() => { document.body.style.overflow = drawer ? "hidden" : ""; }, [drawer]);

  return (
    <>
      <header className="glass sticky top-0 z-40 flex items-center gap-3 px-4 py-3 md:px-8">
        <button aria-label="القائمة" className="md:hidden" onClick={() => setDrawer(true)}><Menu /></button>
        <a href="/" className="font-bold">منصة الباقر</a>
        <nav className="mr-4 hidden gap-4 text-sm md:flex">
          {LINKS.map((l) => <a key={l.href} href={l.href} className="opacity-80 hover:opacity-100">{l.label}</a>)}
        </nav>
        <button onClick={() => setSearch(true)} className="glass mr-auto flex items-center gap-2 rounded-full px-3 py-1.5 text-sm">
          <Search className="h-4 w-4" /><span className="hidden sm:inline opacity-70">بحث</span>
          <kbd dir="ltr" className="hidden text-xs opacity-50 md:inline">Ctrl K</kbd>
        </button>
        <ThemeToggle />
      </header>

      <AnimatePresence>
        {drawer && (<>
          <motion.div key="bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50" onClick={() => setDrawer(false)} />
          <motion.aside key="panel" role="dialog" aria-modal initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0, right: 0.6 }}
            onDragEnd={(_, i) => i.offset.x > 80 && setDrawer(false)}
            className="fixed inset-y-0 right-0 z-50 w-72 space-y-2 bg-[var(--bg)] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold">منصة الباقر</span>
              <button aria-label="إغلاق" onClick={() => setDrawer(false)}><X /></button>
            </div>
            {LINKS.map((l) => <a key={l.href} href={l.href} onClick={() => setDrawer(false)} className="glass block rounded-xl p-3 font-bold">{l.label}</a>)}
            <button onClick={() => { setDrawer(false); setSearch(true); }} className="glass flex w-full items-center gap-2 rounded-xl p-3 font-bold">
              <Search className="h-4 w-4" />بحث</button>
          </motion.aside>
        </>)}
      </AnimatePresence>
      {search && <SearchModal onClose={() => setSearch(false)} />}
    </>
  );
}
