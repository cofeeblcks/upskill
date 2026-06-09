import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { loginBodySchema } from "@/lib/schemas/auth";
import { verifyStoredPassword } from "@/lib/auth/verify-stored-password";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = loginBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validación fallida", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const passwordInput = password.trim();

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (e) {
    const hint =
      e instanceof Error
        ? e.message
        : "Supabase no está configurado. Revisa NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.";
    return NextResponse.json({ error: hint }, { status: 503 });
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, password, role, name, is_active")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!user) {
    const { count, error: countError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });
    if (!countError && (count ?? 0) === 0) {
      return NextResponse.json(
        {
          error:
            "La base de datos no tiene usuarios visibles para la API. Aplica las migraciones y el seed en Supabase y revisa que SUPABASE_SERVICE_ROLE_KEY sea la clave «service_role» del panel (no la anon ni publishable).",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Credenciales incorrectas" },
      { status: 401 }
    );
  }

  if (!user.is_active) {
    return NextResponse.json(
      { error: "Tu cuenta está desactivada. Contacta a RRHH." },
      { status: 401 }
    );
  }

  const verdict = await verifyStoredPassword(passwordInput, user.password);
  if (verdict === "empty") {
    return NextResponse.json(
      {
        error:
          "Esta cuenta no tiene contraseña almacenada. Reaplica el seed de usuarios o restablece la contraseña desde administración.",
      },
      { status: 500 }
    );
  }
  if (verdict === "nomatch") {
    return NextResponse.json(
      { error: "Credenciales incorrectas" },
      { status: 401 }
    );
  }

  const payload = JSON.stringify({
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });
  const response = NextResponse.json({
    role: user.role,
    name: user.name,
  });

  response.cookies.set("upskill-session", payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
