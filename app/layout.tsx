import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Escrowly - AI-Powered Escrow Contracts",
  description: "Create and manage secure escrow contracts with AI-driven dispute resolution. Powered by Genlayer and Supabase.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-screen flex flex-col bg-white text-black">
   
        {/* 🔹 MAIN CONTENT (THIS RENDERS YOUR PAGES) */}
        <main className="flex-1 p-4">
          {children}
        </main>

        {/* 🔹 FOOTER */}
        <footer className="border-t p-4 text-center text-sm">
          © {new Date().getFullYear()} SurelyDrill
        </footer>

      </body>
    </html>
  );
}