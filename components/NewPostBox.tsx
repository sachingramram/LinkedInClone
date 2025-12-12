'use client';
import { useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import type { KeyedMutator } from 'swr';
import { Post } from '@/types/post';

export default function NewPostBox({ mutate }: { mutate?: KeyedMutator<Post[]> }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { data: session } = useSession();

  // NewPostBox.tsx (only the handleSubmit part shown)
const handleSubmit = async () => {
  if (!session) {
    alert('Please sign in');
    return;
  }
  let imageUrl;
  if (file) {
    const fd = new FormData();
    fd.append('file', file);
    const upload = await fetch('/api/upload', { method: 'POST', body: fd });
    const j = await upload.json();
    imageUrl = j.url;
  }

  // create optimistic object including author info
  const optimistic = {
    _id: 'temp-' + Date.now(),
    content: text,
    imageUrl,
    createdAt: new Date().toISOString(),
    authorId: session.user.id,
    authorName: session.user.name,
    authorImage: session.user.image,
    likes: [],
    comments: [],
  };

  if (mutate) mutate((current: any) => [optimistic, ...(current || [])], false);

  // send author fields to server
  await axios.post('/api/posts', {
    content: text,
    imageUrl,
    authorId: session.user.id,
    authorName: session.user.name,
    authorImage: session.user.image,
  });

  setText('');
  setFile(null);
  if (mutate) mutate();
};


  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <textarea
        className="w-full border rounded-md p-2"
        rows={3}
        placeholder="Start a post"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex items-center justify-between mt-2">
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Post
        </button>
      </div>
    </div>
  );
}
