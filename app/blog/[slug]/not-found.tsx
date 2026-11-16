import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center">
      <div className="px-4 text-center">
        <h1 className="text-foreground mb-4 text-4xl font-bold">Articol negăsit</h1>
        <p className="text-muted-foreground mb-8">
          Articolul pe care îl cauți nu există sau a fost șters.
        </p>
        <Link
          href="/blog"
          className="text-primary hover:text-primary/80 inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi la Blog
        </Link>
      </div>
    </main>
  );
}
