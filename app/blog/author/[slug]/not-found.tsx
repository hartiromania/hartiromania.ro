import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">Autor negăsit</h2>
        <p className="text-muted-foreground mb-6">Ne pare rău, dar autorul căutat nu există.</p>
        <Link href="/blog" className="text-primary hover:underline">
          Înapoi la Blog
        </Link>
      </div>
    </div>
  );
}
