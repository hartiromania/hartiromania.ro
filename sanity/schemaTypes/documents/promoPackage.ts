import { defineType, defineField, defineArrayMember } from "sanity";

export const promoPackage = defineType({
  name: "promoPackage",
  title: "Pachet Promo",
  type: "document",
  groups: [
    { name: "main", title: "Principal", default: true },
    { name: "media", title: "Imagini" },
    { name: "story", title: "Poveste" },
    { name: "flags", title: "Etichete" },
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
      title: "Titlu scurt (opțional)",
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
      name: "price",
      title: "Preț (doar cifra, ex: 75)",
      type: "number",
      group: "main",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "priceLabel",
      title: "Etichetă preț personalizată (opțional)",
      type: "string",
      group: "main",
    }),
    defineField({
      name: "description",
      title: "Descriere scurtă",
      type: "text",
      rows: 5,
      group: "main",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "longDescription",
      title: "Descriere lungă (opțional)",
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
    }),

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

    defineField({
      name: "storyTitle",
      title: "Titlu secțiune poveste",
      type: "string",
      group: "story",
    }),
    defineField({
      name: "story",
      title: "Povestea",
      type: "storyContent",
      group: "story",
    }),

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
      title: "Culoare buton (hex, ex: #bb7e09)",
      type: "string",
      group: "main",
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
    select: { title: "title", media: "images.0" },
  },
});
