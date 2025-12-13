'use client';

import axios from 'axios';
import useSWR from 'swr';
import NewPostBox from './NewPostBox';
import PostCard from './PostCard';
import { Post } from '@/types/post';
import ConnectionRequests from "@/components/ConnectionRequests";

const fetcher = (url: string) => axios.get(url).then(r => r.data);

export default function Feed() {
  const { data: posts, error, mutate } = useSWR<Post[]>('/api/posts', fetcher, {
    revalidateOnFocus: true,
    revalidateIfStale: true,
    revalidateOnReconnect: true,
  });

  if (error) return <div className="text-red-500">Failed to load feed.</div>;
  if (!posts) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
        <ConnectionRequests />

      <NewPostBox mutate={mutate} />

      {posts.map((post, i) => {
        // stable key: prefer DB id, fallback to synthetic unique key
        const postKey = String(post._id ?? (post as any).id ?? `post-fallback-${i}`);
        return (
          <PostCard
            key={postKey}
            post={post}
            mutate={mutate}
          />
        );
      })}
    </div>
  );
}
