import { initializeWorkspace, sameOrigin } from "../../../lib/server/auth";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  return new Response(null, {
    status: (await initializeWorkspace()) ? 204 : 401,
  });
}
