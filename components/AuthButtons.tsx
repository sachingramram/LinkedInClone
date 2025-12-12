// components/AuthButtons.tsx (or inside Header.tsx)
'use client';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function AuthButtons() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <div>
        <img src={session.user.image ?? '/favicon.ico'} alt="me" className="h-6 w-6 rounded-full inline-block mr-2" />
        <span className="mr-3">{session.user.name ?? session.user.email}</span>
        <button onClick={() => signOut()} className="px-3 py-1 border rounded">Sign out</button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => signIn('google')} className="px-3 py-1 border rounded">Sign in with Google</button>
      <button onClick={() => signIn('github')} className="px-3 py-1 border rounded">Sign in with GitHub</button>
    </div>
  );
}
