"use client";
import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default function CodeBlock({ code, lang }: { code: string; lang?: string | null }) {
  const [ok, setOk] = useState(false);
  const html = useMemo(() => {
    const l = (lang ?? "").toLowerCase().replace("c++", "cpp");
    const g = Prism.languages[l];
    return g ? Prism.highlight(code, g, l) : esc(code);
  }, [code, lang]);
  const copy = async () => { await navigator.clipboard.writeText(code); setOk(true); setTimeout(() => setOk(false), 1500); };

  return (
    <div dir="ltr" className="glass overflow-hidden rounded-2xl text-left">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2 text-xs">
        <span className="opacity-60">{lang ?? "code"}</span>
        <button onClick={copy} className="flex items-center gap-1 font-bold">
          {ok ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{ok ? "تم النسخ" : "نسخ الكود"}</button>
      </div>
      <div className="flex overflow-x-auto text-sm leading-6">
        <div aria-hidden className="select-none py-4 pl-4 pr-3 text-right opacity-40">
          {code.split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}</div>
        <pre className="py-4 pr-4"><code dangerouslySetInnerHTML={{ __html: html }} /></pre>
      </div>
    </div>
  );
}
