import type { ProductCategory } from "./types";

// Cele 3 categorii sunt structurale (nu se adaugă des) — rămân în cod.
// Mutate aici din products-data.tsx ca să decuplăm de datele de produse (acum în Sanity).
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: "harti",
    title: "Hărți",
    description: "Colecție de hărți istorice autentice din diferite perioade ale României",
    imageUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/harta%20mihai%20viteazul-PO28uRQV9lVZVcsVJcx8zsc1ap9TkF.jpg",
    itemCount: "10+ hărți",
    href: "/produse/harti",
    buttonText: "Explorează",
    buttonColor: "#6b7a43",
  },
  {
    id: "vederi",
    title: "Vederi",
    description:
      "Vederi și cărți poștale vintage cu cei mai iubiți domnitori, voievozi și regi ai româniei",
    imageUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/colaj-vederi-fata-5hcVehK5bFNiTBB5u4VAIyyZXkE0ct.jpg",
    href: "/produse/vederi",
    buttonText: "Descoperă",
    buttonColor: "#505e2b",
  },
  {
    id: "carti",
    title: "Cărți",
    description: "Cărți, legende, istorii, comori...",
    imageUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/coperta-carte.png-iXHaUqE2nX1xCY6INJH2qmwhZQllQ8.jpeg",
    href: "/produse/carti",
    buttonText: "Citește",
    buttonColor: "#5a7219",
  },
];
