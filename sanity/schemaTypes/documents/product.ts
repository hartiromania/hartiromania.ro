import { defineType, defineField, defineArrayMember } from "sanity";

export const product = defineType({
  name: "product",
  title: "Produs",
  type: "document",
  groups: [
    { name: "main", title: "Principal", default: true },
    { name: "media", title: "Imagini" },
    { name: "story", title: "Poveste" },
    { name: "flags", title: "Etichete & ordine" },
    { name: "gift", title: "Cadou" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Titlu",
      type: "string",
      group: "main",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "shortTitle",
      title: "Titlu scurt (opțional — apare pe carduri/listă)",
      type: "string",
      group: "main",
    }),
    defineField({
      name: "slug",
      title: "Slug (adresa din URL)",
      type: "slug",
      group: "main",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Categorie",
      type: "string",
      group: "main",
      options: {
        list: [
          { title: "Hărți", value: "harti" },
          { title: "Vederi", value: "vederi" },
          { title: "Cărți", value: "carti" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "price",
      title: "Preț (doar cifra, ex: 49.61)",
      type: "number",
      group: "main",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "priceLabel",
      title: "Etichetă preț personalizată (opțional — suprascrie formatarea automată)",
      description:
        'Lasă gol pentru formatare automată „49,61 RON". Completează doar pentru cazuri speciale.',
      type: "string",
      group: "main",
    }),
    defineField({
      name: "description",
      title: "Descriere scurtă",
      type: "text",
      rows: 4,
      group: "main",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "longDescription",
      title: "Descriere lungă (opțional — separă paragrafele cu un rând gol)",
      type: "text",
      rows: 6,
      group: "main",
    }),
    defineField({
      name: "specifications",
      title: "Specificații (rânduri etichetă + valoare)",
      type: "array",
      group: "main",
      of: [defineArrayMember({ type: "specification" })],
      // Rânduri prestabilite la produs nou — în ordinea de pe site.
      // Etichetele sunt completate, valorile rămân goale (le scrii tu).
      // Poți șterge orice rând sau adăuga altele noi după nevoie.
      initialValue: [
        { _type: "specification", _key: "spec-dimensiuni", label: "Dimensiuni" },
        { _type: "specification", _key: "spec-autor", label: "Autorul originalului" },
        { _type: "specification", _key: "spec-an-aparitie", label: "Anul apariției" },
        { _type: "specification", _key: "spec-an-reeditare", label: "Anul reeditării" },
        { _type: "specification", _key: "spec-material", label: "Material" },
        { _type: "specification", _key: "spec-ambalaj", label: "Ambalaj" },
      ],
    }),

    // ----- Imagini -----
    defineField({
      name: "images",
      title: "Carusel imagini",
      type: "array",
      group: "media",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "thumbnail",
      title: "Imagine principală/thumbnail (opțional — implicit prima din carusel)",
      type: "imageWithAlt",
      group: "media",
    }),

    // ----- Poveste -----
    defineField({
      name: "storyTitle",
      title: "Titlu secțiune poveste (ex: Povestea hărții)",
      type: "string",
      group: "story",
    }),
    defineField({
      name: "story",
      title: "Povestea",
      type: "storyContent",
      group: "story",
    }),

    // ----- Comandă -----
    defineField({
      name: "orderLink",
      title: "Link buton Comandă (eMag)",
      type: "url",
      group: "main",
      validation: (Rule) => Rule.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "orderButtonText",
      title: "Text buton comandă",
      type: "string",
      group: "main",
      initialValue: "Comandă",
    }),
    defineField({
      name: "buttonColor",
      title: "Culoare buton (hex, ex: #d2691e)",
      type: "string",
      group: "main",
    }),

    // ----- Etichete & ordine -----
    defineField({
      name: "sortOrder",
      title: "Ordine afișare (număr mai mic = mai sus la hărți)",
      type: "number",
      group: "flags",
    }),
    defineField({
      name: "featured",
      title: "Recomandat (featured)",
      type: "boolean",
      group: "flags",
      initialValue: false,
    }),
    defineField({
      name: "isNew",
      title: "Nou ✨",
      type: "boolean",
      group: "flags",
      initialValue: false,
    }),
    defineField({
      name: "isBestSeller",
      title: "Best Seller 🔥",
      type: "boolean",
      group: "flags",
      initialValue: false,
    }),
    defineField({
      name: "availableSoon",
      title: "Disponibil în curând",
      type: "boolean",
      group: "flags",
      initialValue: false,
    }),

    // ----- Cadou -----
    defineField({
      name: "hasGift",
      title: "Are cadou",
      type: "boolean",
      group: "gift",
      initialValue: false,
    }),
    defineField({
      name: "giftProduct",
      title: "Detalii cadou",
      type: "giftProduct",
      group: "gift",
      hidden: ({ parent }) => !parent?.hasGift,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "images.0" },
  },
});
