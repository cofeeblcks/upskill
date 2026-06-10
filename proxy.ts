import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((c) => {
    to.cookies.set(c.name, c.value);
  });
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasSupabaseAuthCookie = request.cookies
    .getAll()
    .some(
      (c) =>
        c.name.startsWith("sb-") &&
        (c.name.includes("auth-token") || c.name.includes("access-token"))
    );
  if (sbUrl && sbKey && hasSupabaseAuthCookie) {
    const supabase = createServerClient<Database>(sbUrl, sbKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });
    await supabase.auth.getUser();
  }

  const session = request.cookies.get("upskill-session");
  const { pathname } = request.nextUrl;

  const protectedPaths = ["/admin", "/dashboard", "/supervisor"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (!session && isProtected) {
    const redirect = NextResponse.redirect(new URL("/", request.url));
    copyCookies(supabaseResponse, redirect);
    return redirect;
  }

  if (session) {
    try {
      const { role } = JSON.parse(session.value) as { role: string };

      if (pathname === "/") {
        const redirect = NextResponse.redirect(
          new URL(roleToPath(role), request.url)
        );
        copyCookies(supabaseResponse, redirect);
        return redirect;
      }

      if (pathname.startsWith("/admin") && role !== "ADMIN_HR") {
        const redirect = NextResponse.redirect(
          new URL(roleToPath(role), request.url)
        );
        copyCookies(supabaseResponse, redirect);
        return redirect;
      }
      if (pathname.startsWith("/supervisor") && role !== "SUPERVISOR") {
        const redirect = NextResponse.redirect(
          new URL(roleToPath(role), request.url)
        );
        copyCookies(supabaseResponse, redirect);
        return redirect;
      }
      if (pathname.startsWith("/dashboard") && role !== "EMPLOYEE") {
        const redirect = NextResponse.redirect(
          new URL(roleToPath(role), request.url)
        );
        copyCookies(supabaseResponse, redirect);
        return redirect;
      }
    } catch {
      const redirect = NextResponse.redirect(new URL("/", request.url));
      redirect.cookies.delete("upskill-session");
      copyCookies(supabaseResponse, redirect);
      return redirect;
    }
  }

  return supabaseResponse;
}

function roleToPath(role: string): string {
  switch (role) {
    case "ADMIN_HR":
      return "/admin";
    case "SUPERVISOR":
      return "/supervisor";
    default:
      return "/dashboard";
  }
}

export const config = {
  matcher: ["/", "/admin/:path*", "/dashboard/:path*", "/supervisor/:path*"],
};
