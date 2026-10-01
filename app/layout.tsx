import "./globals.css";
import { Cairo } from "next/font/google";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });
export const metadata: Metadata = { title: "منصة الباقر لمواد المرحلة الثالثة" };

const themeScript = `try{var t=localStorage.getItem('theme');
if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={cairo.variable}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
