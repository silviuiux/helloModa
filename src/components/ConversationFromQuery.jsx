"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Lets /outfits (and anywhere else) deep-link into a specific conversation
// via /?conversation=<id> — AppShell already owns conversation-switching
// (handleSelectConversation), this just reads the query param once and
// hands it off, then cleans the URL so a refresh doesn't re-trigger it.
// Needs its own Suspense boundary (useSearchParams requirement) — see
// PostHogPageview.jsx for the same pattern.
export default function ConversationFromQuery({ onConversationId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("conversation");

  useEffect(() => {
    if (!id) return;
    onConversationId(id);
    router.replace("/");
  }, [id, onConversationId, router]);

  return null;
}
