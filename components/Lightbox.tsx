"use client";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type Item = { url: string; title: string };
const isImg = (u: string) => /\.(png|jpe?g|webp|gif)$/i.test(u.split("?")[0]);

export default function Lightbox({ items, index, onIndex, onClose }:
  { items: Item[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const cur = items[index];
  const go = (d: number) => onIndex((index + d + items.length) % items.length);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(1);
      if (e.key === "ArrowRight") go(-1);
    };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  });
  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-50 flex flex-col bg-black/85 p-4" onClick={onClose}>
      <div className="mb-2 flex items-center justify-between text-white" onClick={(e) => e.stopPropagation()}>
        <span className="font-bold">{cur.title}</span>
        <button aria-label="إغلاق" onClick={onClose}><X /></button>
      </div>
      <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
        {isImg(cur.url)
          ? <img src={cur.url} alt={cur.title} className="mx-auto h-full max-w-full object-contain" />
          : <iframe src={cur.url} title={cur.title} className="h-full w-full rounded-xl bg-white" />}
        {items.length > 1 && <>
          <button aria-label="السابق" onClick={() => go(-1)} className="glass absolute right-2 top-1/2 rounded-full p-2 text-white"><ChevronRight /></button>
          <button aria-label="التالي" onClick={() => go(1)} className="glass absolute left-2 top-1/2 rounded-full p-2 text-white"><ChevronLeft /></button>
        </>}
      </div>
    </div>
  );
}
