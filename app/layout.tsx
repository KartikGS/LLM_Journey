import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./ui/navbar";
import { OtelInitializer } from "../components/otel-initializer";

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

// import { headers } from "next/headers";

// export default async function RootLayout({
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
      >
        <OtelInitializer>
          <div className="h-full flex">
            <Navbar />
            {children}
          </div>
        </OtelInitializer>
      </body>
    </html>
  );
}
