// Next.js instrumentation hook — loads the right Sentry config per runtime
// and reports framework-level request errors (e.g. a Server Component throw)
// that wouldn't otherwise hit a try/catch. See docs/08-changelog.md.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config.js");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config.js");
  }
}

export async function onRequestError(...args) {
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
}
