import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="bg-[#fafafa]">
        <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="text-foreground mb-4 text-4xl font-bold">Categorie negăsită</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Ne pare rău, categoria pe care o cauți nu există.
          </p>
          <Link
            href="/blog"
            className="text-primary inline-flex items-center gap-2 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi la Blog
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
