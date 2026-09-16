export function isQrPrintRoute(pathname: string): boolean {
  return /^\/dashboard\/qr\/print\/[^/]+$/.test(pathname);
}
