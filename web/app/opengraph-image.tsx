import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FilePress — Compress Images, Videos & PDFs to Any Size";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(0,122,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(0,122,255,0.05)",
          }}
        />

        <div
          style={{
            background: "white",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: "24px",
            padding: "40px 48px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
            maxWidth: "860px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #007aff, #0055b3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              ⬇
            </div>
            <span
              style={{
                fontSize: "36px",
                fontWeight: "700",
                color: "#1d1d1f",
                letterSpacing: "-0.02em",
              }}
            >
              FilePress
            </span>
          </div>

          <div
            style={{
              fontSize: "44px",
              fontWeight: "800",
              color: "#1d1d1f",
              letterSpacing: "-0.03em",
              textAlign: "center",
              lineHeight: "1.1",
              marginBottom: "16px",
            }}
          >
            Your file is too big.{" "}
            <span style={{ color: "#007aff" }}>Tell us how small.</span>
          </div>

          <div
            style={{
              fontSize: "19px",
              color: "#6e6e73",
              textAlign: "center",
              marginBottom: "32px",
              lineHeight: "1.4",
            }}
          >
            Type a target size. FilePress compresses images, videos and PDFs to hit it exactly.
            <br />
            No upload. No cloud. Works offline on Mac and Windows.
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            {["100% Offline", "No Upload", "JPEG · PNG · WEBP · HEIC", "PDF · MP4 · MOV", "Mac + Windows"].map(
              (label) => (
                <div
                  key={label}
                  style={{
                    background: "rgba(0,122,255,0.08)",
                    border: "1px solid rgba(0,122,255,0.18)",
                    borderRadius: "100px",
                    padding: "8px 18px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#007aff",
                  }}
                >
                  {label}
                </div>
              )
            )}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "28px",
            fontSize: "15px",
            color: "#86868b",
          }}
        >
          filepressapp.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
