import { defineType, defineArrayMember, defineField } from "sanity";

// „Povestea hărții" — editor vizual (ca-ntr-un Word) cu paragrafe, subtitluri și linkuri.
// Stilurile de aici sunt redate pe site cu EXACT aceleași clase ca înainte
// (vezi lib/sanity/portable-text-to-html.ts), deci fidelitate 100% la design.
export const storyContent = defineType({
  name: "storyContent",
  title: "Conținut",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      // Stiluri de bloc disponibile în editor
      styles: [
        { title: "Paragraf", value: "normal" },
        { title: "Subtitlu (bold, mare)", value: "subtitlu" },
      ],
      lists: [
        { title: "Listă cu puncte", value: "bullet" },
        { title: "Listă numerotată", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
        annotations: [
          defineArrayMember({
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              defineField({
                name: "href",
                type: "url",
                title: "Adresă (URL)",
                validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ["http", "https"] }),
              }),
            ],
          }),
        ],
      },
    }),
  ],
});
