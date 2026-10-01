# منصة الباقر لمواد المرحلة الثالثة

Next.js (App Router) + TypeScript + Tailwind + Supabase.

## 1) إعداد Supabase
1. أنشئ مشروعاً جديداً على [supabase.com](https://supabase.com).
2. من **SQL Editor** الصق محتوى `supabase/schema.sql` كاملاً ونفّذه. ينشئ الجداول ويحمّل المواد العشر ويفعّل سياسات RLS (القراءة للجميع، والكتابة للمسجّلين فقط).
3. من **Storage** أنشئ bucket باسم `materials` وفعّل خيار **Public bucket**.
4. من **Authentication → Sign In / Providers** أطفئ **Allow new users to sign up**.
   هذا مهم: سياسات الكتابة تسمح لأي مستخدم مسجّل، وإطفاء التسجيل العام يجعل حسابك وحده هو المسموح.
5. من **Authentication → Users → Add user** أنشئ حساب المشرف (بريد وكلمة مرور) وفعّل Auto Confirm.
6. من **Project Settings → API** انسخ `Project URL` و `anon public key`.

## 2) التشغيل محلياً
```bash
npm install
cp .env.local.example .env.local   # ثم عبّئ القيمتين
npm run dev
```
افتح http://localhost:3000 ولوحة المشرف على `/admin/login`.

## 3) النشر على Vercel
1. ارفع المشروع إلى مستودع GitHub.
2. في [vercel.com](https://vercel.com) اختر **Add New → Project** واستورد المستودع.
3. في **Environment Variables** أضف:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. اضغط **Deploy**.
5. بعد النشر، في Supabase افتح **Authentication → URL Configuration** وضع رابط موقعك في **Site URL**.

## 4) الاستخدام
- **روابط التواصل:** عدّل `href="#"` لزرّي تيليغرام وإنستغرام في `components/Home.tsx`.
- **وضع الفصل الثاني:** من `/admin` ثم الإعدادات، فعّل المفتاح عندما تريد فتح مواد الفصل الثاني.
- **الرفع:** تبويب «رفع محتوى»، إما مفصّلاً أو جماعياً (الجماعي يضع ملفات PDF في الملخصات).
- **الجدول:** تبويب «الجدول» لإضافة المحاضرات وتعديلها لكل فصل وشعبة.
- **الأكواد:** في الرفع المفصّل اختر قسم «المختبر والعملي» والصق الكود واسم اللغة (python, c, cpp, java, sql, bash, json, javascript).

## ملاحظات
- أسماء الملفات تُخزَّن بمعرّفات عشوائية، أما العناوين العربية فتُحفظ في قاعدة البيانات.
- حماية `/admin` في الواجهة للتجربة فقط، والحماية الفعلية هي سياسات RLS أعلاه.
