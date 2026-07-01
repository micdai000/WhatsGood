type JsonLdProps = {
  data: Record<string, unknown>;
};

/**
 * Escapes angle brackets so user-generated content (e.g. bio) cannot
 * inject `</script>` and break out of the JSON-LD block.
 * The escaped sequences are valid JSON and decoded by parsers normally.
 */
function safeJsonLd(value: Record<string, unknown>): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e");
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
