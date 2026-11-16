// Date structurate (schema.org) pentru Google și asistenții AI, randate pe server.
// `<` devine < ca un text din CMS să nu poată închide tag-ul <script> (XSS).
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
