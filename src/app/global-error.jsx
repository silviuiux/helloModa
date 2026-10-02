"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Catches errors that escape the whole app shell (rare — most errors are
// caught by Next's per-route error boundaries), reports to Sentry, and
// shows a minimal fallback instead of a blank white screen.
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "grid",
            placeItems: "center",
            minHeight: "100vh",
            padding: "24px",
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            textAlign: "center",
            background: "#fdfcfa",
            color: "#2b2633",
          }}
        >
          <div>
            <h1 style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 40, fontWeight: 400, lineHeight: 1.05 }}>
              That wasn&apos;t supposed to happen.
            </h1>
            <p style={{ marginTop: 14, fontSize: 15, opacity: 0.6, lineHeight: 1.6 }}>
              helloModa hit an unexpected snag. Try again — your wardrobe and looks are safe.
            </p>
            <button
              onClick={() => reset()}
              style={{
                marginTop: 24,
                padding: "12px 24px",
                borderRadius: 999,
                background: "#2b2633",
                color: "white",
                border: "none",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
