'use client';

import { useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import type { KeyedMutator } from 'swr';
import type { Post, Comment } from '@/types/post';
import CommentItem from './CommentItem';
import ConnectButton from "@/components/ConnectButton";


export default function PostCard({
  post,
  mutate,
}: {
  post: Post;
  mutate?: KeyedMutator<Post[]>;
}) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? '';

  // UI state
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // stable post id for comparisons
  const postIdForChild = String(post._id ?? (post as any).id ?? '');

  const liked = !!post.likes?.includes(currentUserId);

  const safeMutate = async () => {
    try {
      if (mutate) await mutate();
    } catch (err) {
      console.warn('safeMutate failed', err);
    }
  };

  // -------------------- toggle like --------------------
  const toggleLike = async () => {
    if (!session) {
      alert('Please sign in to like posts');
      return;
    }
    if (!mutate) return;

    setLoadingLike(true);

    // optimistic update
    mutate(
      (current) => {
        if (!current) return current;
        return current.map((p) => {
          const id = String(p._id ?? (p as any).id ?? '');
          if (id !== postIdForChild) return p;

          const hasLiked = (p.likes ?? []).includes(currentUserId);
          const newLikes = hasLiked
            ? (p.likes || []).filter((u) => u !== currentUserId)
            : [...(p.likes || []), currentUserId];

          return { ...p, likes: newLikes };
        });
      },
      false
    );

    try {
      await axios.post(`/api/posts/${encodeURIComponent(postIdForChild)}/like`);
    } catch (err) {
      console.error('Like API failed', err);
    } finally {
      await safeMutate();
      setLoadingLike(false);
    }
  };

  // -------------------- submit comment --------------------
  const submitComment = async () => {
    if (!session) {
      alert('Please sign in to comment');
      return;
    }
    if (!commentText.trim()) return;
    if (!mutate) return;

    setLoadingComment(true);
    const tempId = 'temp-' + Date.now();

    const optimisticComment: Comment = {
      _id: tempId,
      authorId: currentUserId,
      authorName: session.user?.name ?? 'You',
      content: commentText,
      createdAt: new Date().toISOString(),
    };

    // optimistic: append temp comment
    mutate(
      (posts) => {
        if (!posts) return posts;
        return posts.map((p) =>
          String(p._id ?? (p as any).id ?? '') === postIdForChild
            ? { ...p, comments: [...(p.comments ?? []), optimisticComment] }
            : p
        );
      },
      false
    );

    try {
      const res = await axios.post(
        `/api/posts/${encodeURIComponent(postIdForChild)}/comments`,
        { content: commentText }
      );
      const createdComment: Comment = res.data;

      // replace temp comment with server-created comment
      mutate(
        (posts) => {
          if (!posts) return posts;
          return posts.map((p) =>
            String(p._id ?? (p as any).id ?? '') === postIdForChild
              ? {
                  ...p,
                  comments: (p.comments ?? []).map((c) =>
                    String(c._id ?? (c as any).id ?? '') === tempId ? createdComment : c
                  ),
                }
              : p
          );
        },
        false
      );

      // final revalidate
      await safeMutate();
    } catch (err) {
      console.error('Comment API failed', err);
      // remove temp comment when API fails
      mutate(
        (posts) => {
          if (!posts) return posts;
          return posts.map((p) =>
            String(p._id ?? (p as any).id ?? '') === postIdForChild
              ? { ...p, comments: (p.comments ?? []).filter((c) => String(c._id ?? (c as any).id ?? '') !== tempId) }
              : p
          );
        },
        false
      );
    } finally {
      setCommentText('');
      setShowCommentBox(false);
      setLoadingComment(false);
    }
  };

  // -------------------- delete post --------------------
  const deletePost = async () => {
    if (!confirm('Delete this post?')) return;
    if (!mutate) return;

    setDeleting(true);

    // optimistic remove post
    mutate(
      (posts) => {
        if (!posts) return posts;
        return posts.filter((p) => String(p._id ?? (p as any).id ?? '') !== postIdForChild);
      },
      false
    );

    try {
      await axios.delete(`/api/posts/${encodeURIComponent(postIdForChild)}`);
      // revalidate
      await safeMutate();
    } catch (err) {
      console.error('Delete post failed', err);
      // on error, revalidate to restore original
      await safeMutate();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-start gap-3">
        <img
          src={post.authorImage ?? '/favicon.ico'}
          alt={post.authorName ?? 'avatar'}
          className="h-10 w-10 rounded-full object-cover"
        />

        <div className="flex-1">
           <div className="flex items-center gap-2">
  <span className="text-xs text-gray-400">
    {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
  </span>

  {post.authorId !== currentUserId && (
    <ConnectButton userId={post.authorId} />
  )}

  {post.authorId === currentUserId && (
    <button
      onClick={deletePost}
      disabled={deleting}
      className="text-red-600 text-sm"
    >
      {deleting ? "Deleting..." : "Delete"}
    </button>
  )}
</div>


          

          <p className="mt-3 text-gray-800">{post.content}</p>

          {post.imageUrl && (
            <div className="mt-3">
              <img src={post.imageUrl} alt="post" className="max-h-80 w-full object-cover rounded" />
            </div>
          )}

          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <button
              onClick={toggleLike}
              disabled={loadingLike}
              className={`flex items-center gap-2 ${liked ? 'text-blue-600 font-semibold' : ''}`}
            >
              <span>{liked ? 'Liked' : 'Like'}</span>
              <span className="text-xs text-gray-500">({post.likes?.length ?? 0})</span>
            </button>

            <button onClick={() => setShowCommentBox((s) => !s)} className="flex items-center gap-2">
              <span>Comment</span>
              <span className="text-xs text-gray-500">({post.comments?.length ?? 0})</span>
            </button>

            <button>Share</button>
            <button>Send</button>

            {/* Delete button only for the post owner */}
            {String(post.authorId) === String(currentUserId) && (
              <button
                onClick={deletePost}
                disabled={deleting}
                className={`ml-auto px-2 py-1 rounded text-sm ${deleting ? 'opacity-50' : 'text-red-600'}`}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>

          {showCommentBox && (
            <div className="mt-3">
              <textarea
                rows={2}
                className="w-full border rounded-md p-2"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />

              <div className="flex justify-end gap-2 mt-2">
                <button className="px-3 py-1 border rounded" onClick={() => setShowCommentBox(false)}>
                  Cancel
                </button>
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                  onClick={submitComment}
                  disabled={loadingComment}
                >
                  {loadingComment ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          )}

          {/* Comments list */}
          {post.comments?.length ? (
            <div className="mt-4 space-y-4">
              {post.comments.map((c, idx) => {
                const commentKey = String(c._id ?? (c as any).id ?? `comment-${idx}`);
                return (
                  <CommentItem key={commentKey} comment={c} postId={postIdForChild} mutate={mutate} />
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
