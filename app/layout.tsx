import type { Metadata } from "next";
import "./globals.css";
import { Geist, Inter, Newsreader } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-editorial",
  weight: ["400"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "Resume Tailor — AI-powered resume builder",
  description:
    "Upload your resume, paste a job description, get a tailored, ATS-friendly resume in under 30 seconds. Free. No signup.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Resume Tailor",
    description: "AI resume builder. Tailored to any job in under 30 seconds.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
