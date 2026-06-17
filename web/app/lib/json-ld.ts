export function jsonLdString(data: object): string {
  return JSON.stringify(data).replace(/<\/script>/gi, "<\\/script>");
}
