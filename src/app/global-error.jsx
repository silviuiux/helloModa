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
            background: "#eeecf3",
            color: "#2b2840",
          }}
        >
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600 }}>Something went wrong.</h1>
            <p style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
              helloModa hit an unexpected error. We've been notified.
            </p>
            <button
              onClick={() => reset()}
              style={{
                marginTop: 16,
                padding: "10px 20px",
                borderRadius: 999,
                background: "#8b5cf6",
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
