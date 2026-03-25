"use client";

import { useEffect, useState } from "react";

type OS = "mac" | "windows" | "other";

function detectOS(): OS {
  if (typeof navigator === "undefined") return "mac";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "mac";
  if (ua.includes("win")) return "windows";
  return "other";
}

export function DownloadButton({
  macUrl,
  winUrl,
  version,
}: {
  macUrl: string;
  winUrl: string;
  version: string;
}) {
  const [os, setOS] = useState<OS>("mac");

  useEffect(() => {
    setOS(detectOS());
  }, []);

  const isMac = os === "mac";
  const primaryUrl = isMac ? "/api/download/mac" : "/api/download/win";
  const primaryLabel = isMac ? "Download for Mac" : "Download for Windows";
  const secondaryUrl = isMac ? "/api/download/win" : "/api/download/mac";
  const secondaryLabel = isMac ? "Windows" : "Mac";

  return (
    <div className="flex flex-col items-center gap-3">
      <a
        href={primaryUrl}
        className="inline-flex items-center gap-2 bg-apple-accent hover:bg-apple-accent-hover text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors"
        download
      >
        {isMac ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 12V6.75l6-1.32v6.57H3zm17 0V7.5l-7 1.55V12h7zM3 13h6v6.43L3 18.25V13zm17 0h-7v6.43l7-1.43V13z" />
          </svg>
        )}
        {primaryLabel}
      </a>
      <p className="text-apple-secondary text-sm">
        {version} · Free to try{" "}
        <a
          href={secondaryUrl}
          className="underline underline-offset-2 hover:text-apple-text transition-colors"
          download
        >
          {secondaryLabel} version also available
        </a>
      </p>
    </div>
  );
}

export function DownloadCards({
  macUrl,
  winUrl,
  version,
}: {
  macUrl: string;
  winUrl: string;
  version: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
      {/* macOS */}
      <div className="bg-white border border-apple-border rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-apple-accent-light rounded-xl flex items-center justify-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="#007aff"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-apple-text">macOS</p>
            <p className="text-sm text-apple-secondary">Apple Silicon + Intel</p>
          </div>
        </div>
        <a
          href="/api/download/mac"
          className="w-full text-center bg-apple-accent hover:bg-apple-accent-hover text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
        >
          Download .dmg
        </a>
        <div className="text-xs text-apple-secondary space-y-1">
          <p>1. Open FilePress.dmg</p>
          <p>2. Drag FilePress → Applications</p>
          <p>3. First launch: right-click → Open</p>
        </div>
      </div>

      {/* Windows */}
      <div className="bg-white border border-apple-border rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-apple-accent-light rounded-xl flex items-center justify-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="#007aff"
            >
              <path d="M3 12V6.75l6-1.32v6.57H3zm17 0V7.5l-7 1.55V12h7zM3 13h6v6.43L3 18.25V13zm17 0h-7v6.43l7-1.43V13z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-apple-text">Windows</p>
            <p className="text-sm text-apple-secondary">Windows 10 / 11</p>
          </div>
        </div>
        <a
          href="/api/download/win"
          className="w-full text-center bg-apple-accent hover:bg-apple-accent-hover text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
        >
          Download .exe
        </a>
        <div className="text-xs text-apple-secondary space-y-1">
          <p>1. Download FilePress.exe</p>
          <p>2. SmartScreen: click "More info"</p>
          <p>3. Click "Run anyway"</p>
        </div>
      </div>
    </div>
  );
}
