'use client';

import { useSession } from 'next-auth/react';

export default function ProfileCard() {
  const { data: session } = useSession();

  const userName = session?.user?.name ?? 'Guest';
  const userImage = session?.user?.image;

  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      {userImage ? (
        <img
          src={userImage}
          alt={userName}
          className="mx-auto h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div className="mx-auto h-20 w-20 rounded-full bg-gray-200" />
      )}

      <h3 className="mt-3 font-semibold">{userName}</h3>

      <p className="text-sm text-gray-500">
        {session ? 'Logged in user' : 'Not signed in'}
      </p>

      <div className="mt-4">
        <button className="px-3 py-1 text-sm rounded-md border">
          Open to
        </button>
      </div>
    </div>
  );
}
