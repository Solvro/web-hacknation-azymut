import { betterAuth } from "better-auth";
import { cookies, headers } from "next/headers";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { getPool } from "./db";

const cookieName = "azymut_workspace";
const roles = ["supervisor", "hr", "admin"] as const;
export type Role = (typeof roles)[number];

function createAuth() {
  if (!process.env.BETTER_AUTH_SECRET || !process.env.BETTER_AUTH_URL) {
    throw new Error("Ustaw BETTER_AUTH_SECRET i BETTER_AUTH_URL.");
  }
  return betterAuth({
    database: getPool(),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    rateLimit: { customRules: { "/sign-in/email": { window: 60, max: 12 } } },
    emailAndPassword: { enabled: true, disableSignUp: true },
    user: {
      additionalFields: {
        role: { type: "string", input: false, defaultValue: "supervisor" },
      },
    },
  });
}
let auth: ReturnType<typeof createAuth> | undefined;
export const getAuth = () => (auth ??= createAuth());
export const hasDatabase = () => !!process.env.DATABASE_URL;
const signature = (workspace: string) =>
  createHmac("sha256", process.env.BETTER_AUTH_SECRET!)
    .update("workspace:" + workspace)
    .digest("hex");

async function workspaceCookie() {
  const value = (await cookies()).get(cookieName)?.value;
  if (!value || !/^[\da-f-]{36}\.[\da-f]{64}$/.test(value)) return null;
  const [workspace, mac] = value.split(".");
  return timingSafeEqual(Buffer.from(mac), Buffer.from(signature(workspace)))
    ? workspace
    : null;
}

export async function signedInUser() {
  if (!hasDatabase()) return null;
  const session = await getAuth().api.getSession({ headers: await headers() });
  const role = roles.find((candidate) => candidate === session?.user.role);
  return session && role ? { id: session.user.id, role } : null;
}

export async function demoAccess() {
  const user = await signedInUser();
  const workspace = user && (await workspaceCookie());
  return user && workspace ? { ...user, workspace } : null;
}

export async function initializeWorkspace() {
  if (!(await signedInUser())) return false;
  if (await workspaceCookie()) return true;
  const workspace = randomUUID();
  (await cookies()).set(cookieName, workspace + "." + signature(workspace), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.BETTER_AUTH_URL?.startsWith("https:"),
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}

export function sameOrigin(request: Request) {
  const expected = process.env.BETTER_AUTH_URL;
  if (!expected) return false;
  return request.headers.get("origin") === new URL(expected).origin;
}
