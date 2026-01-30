"use client";

import { useEffect } from "react";

/** Replace with your actual ad slot ID from AdSense (Ad units → get code). */
const AD_CLIENT = "ca-pub-6588924347235622";

/** Default slot when no slotId prop is passed. */
const DEFAULT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT ?? "0000000000";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/** Only push once per page (avoids "already have ads" when Strict Mode or re-mount runs effect twice). */
let pushedThisPage = false;

function isValidSlot(slot: string): boolean {
  return Boolean(slot && slot !== "0000000000");
}

/**
 * One responsive AdSense ad unit. Place where you want the ad.
 * @param slotId – Optional. Use a different ad unit per placement (left, right, bottom). If omitted, uses NEXT_PUBLIC_ADSENSE_SLOT or NEXT_PUBLIC_ADSENSE_SLOT_LEFT.
 */
export function AdSenseBlock({ slotId }: { slotId?: string }) {
  const slot = slotId ?? DEFAULT_SLOT;

  useEffect(() => {
    if (typeof window === "undefined" || pushedThisPage) return;
    pushedThisPage = true;
    // Delay push until after layout so the container has non-zero width (avoids "No slot size for availableWidth=0")
    const t = setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // AdSense script may not be loaded yet
      }
    }, 150);
    return () => clearTimeout(t);
  }, []);

  if (!isValidSlot(slot)) {
    return null; // Don’t render placeholder; set slot ID in env or pass slotId to show ads
  }

  return (
    <div className="my-6 flex justify-center min-h-[90px] w-full" style={{ minWidth: "320px" }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minWidth: "320px" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
