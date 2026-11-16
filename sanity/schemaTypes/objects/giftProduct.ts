import { defineType, defineField, defineArrayMember } from "sanity";

// Cadoul opțional atașat unui produs/pachet (se afișează în popup-ul „Cadou").
export const giftProduct = defineType({
  name: "giftProduct",
  title: "Cadou",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Titlu cadou",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Descriere cadou",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "images",
      title: "Imagini cadou (carusel)",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" })],
    }),
    defineField({
      name: "link",
      title: "Link către pagina cadoului (ex: /produse/vederi/...)",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "title", media: "images.0" },
  },
});
