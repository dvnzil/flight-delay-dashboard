import type { Metadata } from "next";
import { Geist, Geist_Mono, Saira_Condensed } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sairaCondensed = Saira_Condensed({
  variable: "--font-saira-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Flight Delay Dashboard",
  description: "Where flights actually run late, and why — BTS 2024 on-time performance data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sairaCondensed.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
