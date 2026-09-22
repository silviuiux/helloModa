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
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
            background: "#f5f3fa",
            color: "#1e1a2e",
          }}
        >
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600 }}>That wasn&apos;t supposed to happen.</h1>
            <p style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
              helloModa hit an unexpected snag. Try again — your wardrobe and looks are safe.
            </p>
            <button
              onClick={() => reset()}
              style={{
                marginTop: 16,
                padding: "10px 20px",
                borderRadius: 12,
                background: "#8b6cf0",
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
