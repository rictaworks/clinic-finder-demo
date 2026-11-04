/** Cookie ヘッダから指定名の値を取り出す。見つからなければ null。 */
export function readCookie(header: string | null | undefined, name: string): string | null {
  if (!header) {
    return null;
  }
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) {
      continue;
    }
    if (part.slice(0, separator).trim() === name) {
      return part.slice(separator + 1).trim();
    }
  }
  return null;
}

/** セッション Cookie。同一オリジン配信のため SameSite=Lax、本番のみ Secure。 */
export function buildSessionCookie(name: string, value: string, maxAgeSeconds: number, secure: boolean): string {
  const attributes = [`${name}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAgeSeconds}`];
  if (secure) {
    attributes.push('Secure');
  }
  return attributes.join('; ');
}
