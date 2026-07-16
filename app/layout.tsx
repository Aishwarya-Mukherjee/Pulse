import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Team Pulse AI – Overview Dashboard",
  description:
    "Team-level wellness and collaboration insights. No individual monitoring or surveillance.",
};

import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import { ConfigProvider } from "@/app/contexts/ConfigContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-on-surface" suppressHydrationWarning>
        <ConfigProvider>
          <TopNav />
          {children}
          <Footer />
        </ConfigProvider>
      </body>
    </html>
  );
}
