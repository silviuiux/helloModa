import { Suspense } from "react";
import "./globals.css";
import PostHogPageview from "../components/PostHogPageview.jsx";
import { SITE_URL } from "../lib/siteConfig.js";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "helloModa — AI stylist",
  description:
    "helloModa — a conversational AI stylist that turns mood, occasion, wardrobe and budget into curated outfit direction. Part of helloCorp.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230f0e0c'/%3E%3Ccircle cx='16' cy='16' r='8' fill='%23d4a853'/%3E%3Ccircle cx='16' cy='16' r='12' fill='none' stroke='%23d4a853' stroke-opacity='.35'/%3E%3C/svg%3E",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="app-canvas">

        <Suspense fallback={null}>
          <PostHogPageview />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
