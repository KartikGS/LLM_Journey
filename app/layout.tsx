import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./ui/navbar";
import { ClientBootstrap } from "./ClientBootstrap";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "LLM Journey",
  description: "Various LLM improvements over time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
      >
        <div className="h-full flex">
          <ClientBootstrap />
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
