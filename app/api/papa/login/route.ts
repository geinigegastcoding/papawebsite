import { NextResponse } from 'next/server';

import { createPapaSession, isPapaAuthConfigured, PAPA_SESSION_COOKIE, PAPA_SESSION_MAX_AGE, verifyPapaPassword } from '@/lib/papa-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isPapaAuthConfigured()) return Response.json({ message: 'De portal is nog niet geconfigureerd.' }, { status: 503 });

  let password = '';
  try {
    const body = await request.json() as { password?: unknown };
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    return Response.json({ message: 'Ongeldig verzoek.' }, { status: 400 });
  }

  if (!(await verifyPapaPassword(password))) return Response.json({ message: 'Onjuist wachtwoord.' }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(PAPA_SESSION_COOKIE, await createPapaSession(), {
    httpOnly: true,
    maxAge: PAPA_SESSION_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  return response;
}
