import { NewsletterForm } from "./newsletter-form";

export function NewsletterBlogCTA() {
  return (
    <aside
      className="border-accent-orange/30 not-prose my-10 rounded-md border-y bg-amber-50/50 px-4 py-6 md:my-12 md:px-6 md:py-7"
      aria-labelledby="newsletter-blog-cta-title"
    >
      <div className="mx-auto max-w-xl text-center">
        <h3
          id="newsletter-blog-cta-title"
          className="text-accent-orange mb-2 text-xl font-bold md:text-2xl"
        >
          Ți-a plăcut articolul?
        </h3>
        <p className="text-muted-foreground mb-4 text-base leading-relaxed md:text-lg">
          Abonează-te la newsletter pentru a fi la curent cu toate produsele noi și postările de pe
          blog.
        </p>
        <NewsletterForm variant="footer" source="blog-cta" className="text-left" />
      </div>
    </aside>
  );
}
