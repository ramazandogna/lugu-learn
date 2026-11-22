/**
 * CORS for browser-called edge functions. Auth is a bearer token (no cookies), so the origin list is
 * defence in depth: `LUGU_ALLOWED_ORIGINS` (comma-separated) or `*` when unset.
 */
const allowed = (Deno.env.get('LUGU_ALLOWED_ORIGINS') ?? '*')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? ''
  const allowOrigin = allowed.includes('*') ? '*' : allowed.includes(origin) ? origin : (allowed[0] ?? '')
  return {
    'access-control-allow-origin': allowOrigin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
    vary: 'origin',
  }
}

/** The response to a CORS preflight, or null for any other request. */
export function preflight(req: Request): Response | null {
  return req.method === 'OPTIONS' ? new Response(null, { status: 204, headers: corsHeaders(req) }) : null
}

export function json(req: Request, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}
