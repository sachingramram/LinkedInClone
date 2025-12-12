'use client';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-xl font-bold">LinkedClone</Link>
        <div className="relative hidden sm:block">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            placeholder="Search"
            className="pl-10 pr-4 py-2 rounded-md border bg-white w-80"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <nav className="hidden sm:flex gap-2">
          <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">My Network</Link>
          <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Jobs</Link>
          <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Messaging</Link>
        </nav>

        {session ? (
          <div className="flex items-center gap-3">
            <div className="text-sm">{session.user?.name}</div>
            <img src={session.user?.image ?? '/favicon.ico'} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
            <button onClick={() => signOut()} className="text-sm px-3 py-1 border rounded">Sign out</button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={() => signIn()} className="text-sm px-3 py-1 border rounded">Sign in</button>
          </div>
        )}
      </div>
    </header>
  );
}
