import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Web3Provider } from "@/contexts/web3-context";
import { SmartAccountProvider } from "@/contexts/smart-account-context";
import { DelegationProvider } from "@/contexts/delegation-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AppKit } from "@/lib/web3/reown-config";

export const metadata: Metadata = {
  title: "SecureFlow - Trustless Escrow on Base",
  description: "Trustless payments with transparent milestones powered by Base",
  generator: "SecureFlow",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/placeholder-logo.png", sizes: "32x32", type: "image/png" },
      { url: "/placeholder-logo.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/placeholder-logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/placeholder-logo.png"
        />
        <link rel="icon" type="image/svg+xml" href="/placeholder-logo.svg" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/placeholder-logo.png"
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppKit>
            <Suspense fallback={<div>Loading...</div>}>
              <Web3Provider>
                <DelegationProvider>
                  <SmartAccountProvider>
                    <NotificationProvider>
                      <Navbar />
                      <main className="pt-16">{children}</main>
                      <Toaster />
                    </NotificationProvider>
                  </SmartAccountProvider>
                </DelegationProvider>
              </Web3Provider>
            </Suspense>
          </AppKit>
        </ThemeProvider>
      </body>
    </html>
  );
}
