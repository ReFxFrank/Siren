/**
 * Deterministic JSON: recursively sorted keys, 2-space indent, trailing
 * newline. Same assembled job ⇒ byte-identical manifest file (§6.4).
 */
export function stableStringify(value: unknown): string {
  return `${render(value, 0)}\n`;
}

function render(value: unknown, depth: number): string {
  const pad = "  ".repeat(depth + 1);
  const close = "  ".repeat(depth);
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value ?? null);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((v) => `${pad}${render(v, depth + 1)}`);
    return `[\n${items.join(",\n")}\n${close}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  if (entries.length === 0) return "{}";
  const items = entries.map(
    ([k, v]) => `${pad}${JSON.stringify(k)}: ${render(v, depth + 1)}`,
  );
  return `{\n${items.join(",\n")}\n${close}}`;
}
