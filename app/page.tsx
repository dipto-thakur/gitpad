// app/page.tsx

import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";

import { SignInButton } from "@/components/sign/SignInButton";

const TRUST_ITEMS = [
  "Official GitHub OAuth",
  "Private repositories supported",
  "No Git. No terminal.",
];

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/repos");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-safe">
      <section className="flex w-full max-w-sm flex-col items-center">
        <header className="space-y-4 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            GitNote
          </h1>

          <p className="text-base font-medium tracking-tight text-foreground">
            Edit. Commit. Done.
          </p>

          <p className="text-sm leading-6 text-muted-foreground">
            A lightweight GitHub document client for READMEs, notes, configs,
            and text files.
          </p>
        </header>

        <div className="mt-10">
          <SignInButton />
        </div>

        <ul className="mt-8 w-full space-y-3 border-t border-border pt-6">
          {TRUST_ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 text-sm text-muted-foreground"
            >
              <Check className="h-4 w-4 shrink-0 text-foreground" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}