"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export function FarcasterSDKProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Call ready() as soon as possible to hide the loading splash screen
    sdk.actions.ready();
  }, []);

  return <>{children}</>;
}
