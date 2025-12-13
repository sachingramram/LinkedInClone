'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import type { KeyedMutator } from 'swr';
import { Post } from '@/types/post';

export default function NewPostBox({ mutate }: { mutate?: KeyedMutator<Post[]> }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  const handleSubmit = async () => {
    if (!session) {
      alert('Please sign in');
      return;
    }

    if (!text.trim() && !file) return;

    try {
      setLoading(true);

      let imageUrl;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const upload = await fetch('/api/upload', { method: 'POST', body: fd });
        const j = await upload.json();
        imageUrl = j.url;
      }

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
    } catch (err) {
      console.error('Post failed', err);
      alert('Failed to post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <textarea
        className="w-full border rounded-md p-2"
        rows={3}
        placeholder="Start a post"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        disabled={loading}
      />

      <div className="flex items-center justify-between mt-2">
        {/* Upload icon button */}
        <button
          type="button"
          disabled={loading}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
        >
          {/* Upload Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#007bff" className="bi bi-file-arrow-up-fill" viewBox="0 0 16 16">
  <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M7.5 6.707 6.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0z"/>
</svg>

          <span className="text-sm">
            {file ? file.name : 'Upload image'}
          </span>
        </button>

        {/* Post button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 disabled:opacity-60"
        >
          {loading && (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {loading ? 'Posting...' : 'POST'}
        </button>
      </div>
    </div>
  );
}
