import { NextResponse } from 'next/server';

import { PAPA_SESSION_COOKIE } from '@/lib/papa-auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PAPA_SESSION_COOKIE, '', { httpOnly: true, maxAge: 0, path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  return response;
}
