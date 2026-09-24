import { Suspense } from "react";
import "./globals.css";
import PostHogPageview from "../components/PostHogPageview.jsx";
import { SITE_URL } from "../lib/siteConfig.js";

const TITLE = "helloModa — the AI stylist that starts in your closet";
const DESCRIPTION =
  "Tell helloModa where you're going. It styles a look from clothes you already own, paints it on you in watercolour, and only suggests buying something when your wardrobe can't cover it. A helloCorp company, live at hellomoda.shop.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "helloModa",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23f5f3fa'/%3E%3Ccircle cx='16' cy='16' r='8' fill='%238b6cf0'/%3E%3Ccircle cx='16' cy='16' r='12' fill='none' stroke='%238b6cf0' stroke-opacity='.35'/%3E%3C/svg%3E",
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
