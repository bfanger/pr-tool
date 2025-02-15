export default function extractDomain(maybeUrl: string): string {
  try {
    const url = new URL(maybeUrl);
    return url.host;
  } catch {
    return maybeUrl;
  }
}
