import { toHTML, type PortableTextHtmlComponents } from "@portabletext/to-html";

// Redă „Povestea" (Portable Text din Sanity) ca HTML cu EXACT aceleași clase
// Tailwind ca în conținutul vechi, ca să arate identic în secțiunea cu
// dangerouslySetInnerHTML din paginile de produs/pachet.
const components: Partial<PortableTextHtmlComponents> = {
  block: {
    // Paragraf normal
    normal: ({ children }) => `<p class="mb-4">${children}</p>`,
    // Subtitlu bold mare (ca <p class="... text-2xl font-bold ...">)
    subtitlu: ({ children }) =>
      `<p class="mb-4 text-2xl md:text-2xl font-bold text-card-foreground">${children}</p>`,
  },
  marks: {
    link: ({ children, value }) => {
      const href: string = (value as { href?: string })?.href || "#";
      const isExternal = /^https?:\/\//i.test(href);
      const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a class="text-accent-orange underline" href="${href}"${attrs}>${children}</a>`;
    },
  },
};

// Ce acceptă toHTML: un bloc sau o listă de blocuri Portable Text.
export type PortableTextInput = Parameters<typeof toHTML>[0];

export function storyToHtml(blocks?: PortableTextInput | null): string | undefined {
  if (!blocks || (Array.isArray(blocks) && blocks.length === 0)) return undefined;
  const html = toHTML(blocks, { components });
  return html && html.trim() ? html : undefined;
}
