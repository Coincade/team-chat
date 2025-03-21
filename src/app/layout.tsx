import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { ConvexClientProvider } from "@/components/convex-client-component";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Modal } from "@/components/modals";
import { Toaster } from "@/components/ui/sonner";
import { JotaiProvider } from "@/components/jotai-provider";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

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

const Righteous = localFont({
  src: "../assets/fonts/Righteous/Righteous/Righteous-Regular.ttf"
})

export const metadata: Metadata = {
  title: "Team Chat",
  description: "Team Chat App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${Righteous} antialiased`}
        >
          <ConvexClientProvider>
            <JotaiProvider>
            <NuqsAdapter>
              <Toaster />
              <Modal />
              {children}
              </NuqsAdapter>
            </JotaiProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
