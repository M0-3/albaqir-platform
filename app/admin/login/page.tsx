"use client";
import { useState } from "react";
import { adminClient } from "@/lib/adminClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setErr("");
    setLoading(true);

    const sb = adminClient();
    const { error } = await sb.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      return setErr("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    }

    location.href = "/admin";
  }

  return (
    <main className="grid min-h-[80vh] place-items-center p-4">
      <div className="glass w-full max-w-sm space-y-4 rounded-3xl p-8">
        <h1 className="text-xl font-bold">دخول المشرف</h1>
        <input 
          dir="ltr" 
          type="email" 
          placeholder="البريد الإلكتروني" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          className="glass w-full rounded-xl p-3" 
        />
        <input 
          dir="ltr" 
          type="password" 
          placeholder="كلمة المرور" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          className="glass w-full rounded-xl p-3" 
        />
        {err && <p role="alert" className="text-sm text-red-500">{err}</p>}
        <button 
          onClick={submit} 
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 p-3 font-bold text-white disabled:opacity-50"
        >
          {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
        </button>
      </div>
    </main>
  );
}