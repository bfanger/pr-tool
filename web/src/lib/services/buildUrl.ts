/**
 * Inject the params into the url and add the remaining params as search/query params
 *
 * Usage:
 *   buildUrl("/users/[id]", { id: "123", tab: "settings" }); // returns '/users/123?tab=settings
 */
export default function buildUrl(
  path: string,
  params: Record<string, string>,
  skipNulls = false,
) {
  const query = { ...params };
  let interpolatedPath = path;
  for (const [param, value] of Object.entries(params)) {
    if (!value && skipNulls) {
      delete query[param];
    }

    const replaced = interpolatedPath.replace(`[${param}]`, value);
    if (replaced !== interpolatedPath) {
      interpolatedPath = replaced;
      delete query[param];
    }
  }
  const search = new URLSearchParams(query).toString();
  return `${interpolatedPath}${search ? `?${search}` : ""}`;
}
