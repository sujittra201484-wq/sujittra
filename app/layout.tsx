import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import SiteHeader from "@/components/site-header";
import "./globals.css";

const plexThai = IBM_Plex_Sans_Thai({
  variable: "--font-plex-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ระบบติดตามคำสั่งซื้อ | สำนักพิมพ์อมตะ",
  description: "ระบบติดตามคำสั่งซื้อหนังสือจากร้านค้า สำนักพิมพ์อมตะ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${plexThai.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
