import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-md space-y-6 text-center">
          <h1 className="text-foreground text-6xl font-bold">404</h1>
          <h2 className="text-foreground text-2xl font-semibold">Produsul nu a fost găsit</h2>
          <p className="text-muted-foreground">
            Ne pare rău, produsul pe care îl căutați nu există sau a fost mutat.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/produse">
              <Button className="bg-accent-orange hover:bg-accent-orange-dark">
                Vezi toate produsele
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Înapoi acasă</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
