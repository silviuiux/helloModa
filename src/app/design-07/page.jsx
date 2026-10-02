import { redirect } from "next/navigation";

// design-07 became the main interface on 2026-10-02 — it lives at "/" now.
export default function Page() {
  redirect("/");
}
