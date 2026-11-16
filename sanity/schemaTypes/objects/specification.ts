import { defineType, defineField } from "sanity";

// Un rând din tabelul de specificații: etichetă + valoare.
export const specification = defineType({
  name: "specification",
  title: "Specificație",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Etichetă (ex: Dimensiuni, Material, Anul apariției)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "value",
      title: "Valoare",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "value" },
  },
});
