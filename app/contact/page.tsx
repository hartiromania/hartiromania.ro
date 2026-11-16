import { pageMetadata } from "@/lib/seo";
import ContactPage from "./contact-client";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Scrie-ne pentru comenzi personalizate, colaborări sau întrebări despre hărți. Ne găsești la contact@hartiromania.ro și la telefon, în Râșnov.",
  path: "/contact",
});

export default function Page() {
  return <ContactPage />;
}
