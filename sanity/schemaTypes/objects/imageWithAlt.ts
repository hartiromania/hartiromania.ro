import { defineType, defineField } from "sanity";

// Imagine cu text alternativ (alt) — folosită în caruselele de produs/pachet.
export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Imagine",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Text alternativ (descriere pentru SEO și accesibilitate)",
      type: "string",
    }),
  ],
});
