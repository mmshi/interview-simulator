import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/store/SessionContext";
import { Logo } from "@/components/ui/Logo";
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
  title: "Interview Simulator",
  description: "Practice behavioral, case, and situational interview questions with AI feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <SessionProvider>
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-4xl items-center px-4 py-4">
              <Logo />
            </div>
          </header>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
