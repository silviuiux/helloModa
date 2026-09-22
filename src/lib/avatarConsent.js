// helloAvatar consent copy — the one place this text lives, so the UI
// checkbox and the API route that stamps `consent_text_version` can't drift
// apart (docs/06-risks-legal.md #3: "explicit, specific consent flow ...
// separate from general ToS acceptance"). Bump this version string if the
// copy below changes in a way that should force re-consent on next
// generation — the API route only accepts a request whose client sent this
// exact version.
export const AVATAR_CONSENT_TEXT_VERSION = "v1";

export function avatarConsentCopy(isSelf) {
  if (isSelf) {
    return (
      "I agree to let helloModa analyze my photo to paint a stylized watercolor avatar of me. " +
      "The photo itself is never stored — it's used once, in memory, to describe my general " +
      "build, hair, and coloring to the illustration model, then discarded. Only the finished " +
      "watercolor image is saved, and I can delete it (and this profile) at any time."
    );
  }
  return (
    "I confirm I have this person's permission — or I'm their parent/guardian — to upload their " +
    "photo and create their avatar. The photo itself is never stored — it's used once, in memory, " +
    "to describe general build, hair, and coloring to the illustration model, then discarded. Only " +
    "the finished watercolor image is saved, and it can be deleted at any time."
  );
}
