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
import { FarcasterSDKProvider } from "@/components/farcaster-sdk-provider";

export const metadata: Metadata = {
  title: "SecureFlow - Trustless Escrow on Base",
  description: "Trustless payments with transparent milestones powered by Base",
  generator: "SecureFlow",
  manifest: "/manifest.json",
  icons: {
    icon: "/secureflow-favicon.svg?v=2",
    apple: "/secureflow-favicon.svg?v=2",
    shortcut: "/secureflow-favicon.svg?v=2",
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
        <link
          rel="icon"
          href="/secureflow-favicon.svg?v=2"
          type="image/svg+xml"
        />
        <link rel="apple-touch-icon" href="/secureflow-favicon.svg?v=2" />
        <link rel="manifest" href="/manifest.json" />

        {/* Farcaster Mini App Embed Metadata */}
        <meta
          name="fc:miniapp"
          content='{
          "version":"next",
          "imageUrl":"https://secure-flow-base.vercel.app/secureflow-favicon.svg?v=2",
          "button":{
            "title":"Launch SecureFlow",
            "action":{
              "type":"launch_miniapp",
              "name":"SecureFlow",
              "url":"https://secure-flow-base.vercel.app"
            }
          }
        }'
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FarcasterSDKProvider>
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
          </FarcasterSDKProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
