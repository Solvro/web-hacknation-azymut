import { getAuth, hasDatabase } from "../../../../lib/server/auth";

function handle(request: Request) {
  return hasDatabase()
    ? getAuth().handler(request)
    : new Response("Tryb lokalny bez kont.", { status: 503 });
}

export { handle as GET, handle as POST };
