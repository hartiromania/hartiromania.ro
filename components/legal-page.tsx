import type { ReactNode } from "react";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

/** Shared frame of the policy pages: title, last update and readable long text. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <article className="text-foreground mx-auto max-w-3xl text-lg leading-relaxed md:text-xl [&_a]:text-[var(--orange-accent)] [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold md:[&_h2]:text-3xl [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:mt-1 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6">
          <h1 className="text-4xl font-bold md:text-5xl">{title}</h1>
          <p className="text-muted-foreground !mt-2 text-base">Ultima actualizare: {updated}</p>
          {children}
        </article>
      </main>
      <Footer />
    </div>
  );
}
