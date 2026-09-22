// Placeholder social sign-in buttons — visually present, functionally inert.
// Wire these up (Supabase OAuth providers) when helloModa is ready to go
// beyond invite-only/private-beta (docs/06-risks-legal.md).

const PROVIDERS = [
  {
    name: "Google",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18">
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.2 14.7 2.2 12 2.2 6.9 2.2 2.8 6.4 2.8 12S6.9 21.8 12 21.8c5.5 0 9.1-3.9 9.1-9.3 0-.6-.07-1.1-.15-1.5H12z"
        />
      </svg>
    ),
  },
  {
    name: "Apple",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M16.5 1.5c.1 1.1-.3 2.2-1 3-.7.8-1.8 1.5-2.9 1.4-.1-1.1.4-2.2 1-3 .8-.8 2-1.4 2.9-1.4zM20 17c-.6 1.3-.9 1.9-1.6 3-1 1.5-2.5 3.4-4.3 3.4-1.6 0-2-.9-3.9-1s-2.4 1-4 .9c-1.8-.1-3.2-1.9-4.2-3.4C-.3 15.9.4 11 3.3 8.5c1.4-1.2 3-1.9 4.5-1.9 1.6 0 2.6 1 3.9 1s2.1-1.1 4-1c.8 0 3 .3 4.4 2.4-3.6 2-3 6.9-.1 8z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18">
        <path
          fill="#1877F2"
          d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"
        />
      </svg>
    ),
  },
  {
    name: "X",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M18.9 2H22l-7.2 8.3L23.3 22h-6.6l-5.2-6.8L5.5 22H2.3l7.7-8.8L1 2h6.8l4.7 6.2L18.9 2zm-1.2 18h1.8L7.4 4H5.5l12.2 16z" />
      </svg>
    ),
  },
];

export default function SocialButtons() {
  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {PROVIDERS.map((p) => (
          <button
            key={p.name}
            type="button"
            disabled
            title={`${p.name} sign-in — coming soon`}
            aria-label={`${p.name} sign-in (coming soon)`}
            className="grid h-11 cursor-not-allowed place-items-center rounded-xl2 border border-line bg-white/[0.04] text-ink/60 opacity-70"
          >
            {p.icon}
          </button>
        ))}
      </div>
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="label text-faint">or use email</span>
        <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}
