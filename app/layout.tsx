import type { Metadata } from "next";
import { Geist, Domine } from "next/font/google";
import "./globals.css";
import I18nProvider from "@/components/I18nProvider";
import NavBar from "@/components/NavBar";
import { Analytics } from '@vercel/analytics/next';

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const domine = Domine({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-domine" });

export const metadata: Metadata = {
  title: "NYC Legal Aid Finder",
  description: "Find free and low-cost legal services in New York City.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${domine.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-stone-50 font-sans">
        <I18nProvider>
          <NavBar />
          <main className="flex-1">{children}</main>
          <footer className="text-center text-xs text-gray-400 py-4 px-4">
            This app helps you find resources — it is not legal advice.
          </footer>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
