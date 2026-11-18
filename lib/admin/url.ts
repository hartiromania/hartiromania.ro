/**
 * Internal path of an admin page, for redirects. A server action renders its redirect
 * target inside the same request, without passing through the proxy that maps the admin
 * host to app/admin; the internal path works both there and in the browser (the proxy
 * leaves /admin/... unchanged).
 */
export function adminPath(path: string): string {
  return path === "/" ? "/admin" : `/admin${path}`;
}
