// components/CommentItem.tsx
'use client';
import { useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import type { KeyedMutator } from 'swr';
import type { Post as PostType, Comment as UIComment, Reply as UIReply } from '@/types/post';

export default function CommentItem({
  comment,
  postId,
  mutate,
}: {
  comment: UIComment;
  postId: string; // must be provided by PostCard (String(post._id))
  mutate?: KeyedMutator<PostType[]>;
}) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? '';

  const [loadingDelete, setLoadingDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [loadingReply, setLoadingReply] = useState(false);

  // reliably compute commentId (works for Mongo _id or fallback `id`)
  const commentId = String(comment._id ?? (comment as any).id ?? '');

  const safeMutate = async () => {
    try {
      if (mutate) await mutate();
    } catch (e) {
      console.warn('safeMutate failed', e);
    }
  };

  // ---------- DELETE COMMENT ----------
  const deleteComment = async () => {
    if (!commentId) {
      console.error('❌ deleteComment missing commentId:', comment);
      alert('Internal error: commentId missing');
      return;
    }
    if (!postId) {
      console.error('❌ deleteComment missing postId:', postId);
      alert('Internal error: postId missing');
      return;
    }
    if (!mutate) {
      alert('Mutate function not provided');
      return;
    }

    if (!confirm('Delete this comment?')) return;

    setLoadingDelete(true);

    // optimistic: remove comment locally
    mutate(
      (posts) => {
        if (!posts) return posts;
        return posts.map((p) =>
          String(p._id ?? (p as any).id ?? '') === String(postId)
            ? { ...p, comments: (p.comments || []).filter((c) => String(c._id ?? (c as any).id ?? '') !== commentId) }
            : p
        );
      },
      false
    );

    try {
      await axios.delete(
        `/api/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`
      );
    } catch (err) {
      console.error('Delete comment API failed', err);
    } finally {
      await safeMutate();
      setLoadingDelete(false);
    }
  };

  // ---------- EDIT COMMENT ----------
  const saveEdit = async () => {
    if (!editText.trim()) return;

    if (!commentId) {
      console.error('❌ saveEdit missing commentId:', comment);
      alert('Internal error: commentId missing');
      return;
    }

    try {
      await axios.put(
        `/api/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`,
        { content: editText }
      );
      setEditing(false);
      await safeMutate();
    } catch (err) {
      console.error('Edit comment API failed', err);
    }
  };

  // ---------- CREATE REPLY ----------
  const submitReply = async () => {
    if (!replyText.trim()) return;
    if (!commentId) {
      console.error('❌ submitReply missing commentId:', comment);
      alert('Internal error: commentId missing');
      return;
    }
    if (!postId) {
      console.error('❌ submitReply missing postId:', postId);
      alert('Internal error: postId missing');
      return;
    }
    if (!mutate) {
      alert('Mutate not provided');
      return;
    }

    setLoadingReply(true);
    const tempId = 'temp-reply-' + Date.now();
    const optimisticReply: UIReply = {
      _id: tempId,
      authorId: currentUserId,
      authorName: session?.user?.name ?? 'You',
      content: replyText,
      createdAt: new Date().toISOString(),
    };

    // optimistic append
    mutate(
      (posts) => {
        if (!posts) return posts;
        return posts.map((p) =>
          String(p._id ?? (p as any).id ?? '') === String(postId)
            ? {
                ...p,
                comments: (p.comments || []).map((c) =>
                  String(c._id ?? (c as any).id ?? '') === commentId
                    ? { ...c, replies: [...(c.replies || []), optimisticReply] }
                    : c
                ),
              }
            : p
        );
      },
      false
    );

    try {
      const res = await axios.post(
        `/api/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}/reply`,
        { content: replyText }
      );
      const created = res.data;

      // replace temp reply with actual
      mutate(
        (posts) => {
          if (!posts) return posts;
          return posts.map((p) =>
            String(p._id ?? (p as any).id ?? '') === String(postId)
              ? {
                  ...p,
                  comments: (p.comments || []).map((c) =>
                    String(c._id ?? (c as any).id ?? '') === commentId
                      ? {
                          ...c,
                          replies: (c.replies || []).map((r) =>
                            String(r._id) === String(tempId) ? created : r
                          ),
                        }
                      : c
                  ),
                }
              : p
          );
        },
        false
      );

      await safeMutate();
    } catch (err) {
      console.error('Create reply API failed', err);
      // remove temp reply on failure
      mutate(
        (posts) => {
          if (!posts) return posts;
          return posts.map((p) =>
            String(p._id ?? (p as any).id ?? '') === String(postId)
              ? {
                  ...p,
                  comments: (p.comments || []).map((c) =>
                    String(c._id ?? (c as any).id ?? '') === commentId
                      ? { ...c, replies: (c.replies || []).filter((r) => String(r._id) !== tempId) }
                      : c
                  ),
                }
              : p
          );
        },
        false
      );
    } finally {
      setReplyText('');
      setShowReplyBox(false);
      setLoadingReply(false);
    }
  };

  // ---------- EDIT REPLY ----------
  const editReply = async (replyId: string, newContent: string) => {
    if (!replyId) {
      console.error('❌ editReply missing replyId');
      return;
    }
    try {
      await axios.put(
        `/api/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}/reply/${encodeURIComponent(replyId)}`,
        { content: newContent }
      );
      await safeMutate();
    } catch (err) {
      console.error('Edit reply API failed', err);
    }
  };

  // ---------- DELETE REPLY ----------
  const deleteReply = async (replyId: string) => {
    if (!replyId) {
      console.error('❌ deleteReply missing replyId');
      return;
    }

    // optimistic remove
    mutate?.(
      (posts) => {
        if (!posts) return posts;
        return posts.map((p) =>
          String(p._id ?? (p as any).id ?? '') === String(postId)
            ? {
                ...p,
                comments: (p.comments || []).map((c) =>
                  String(c._id ?? (c as any).id ?? '') === commentId
                    ? { ...c, replies: (c.replies || []).filter((r) => String(r._id) !== replyId) }
                    : c
                ),
              }
            : p
        );
      },
      false
    );

    try {
      await axios.delete(
        `/api/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}/reply/${encodeURIComponent(replyId)}`
      );
      await safeMutate();
    } catch (err) {
      console.error('Delete reply API failed', err);
      await safeMutate();
    }
  };

  return (
    <div className="pl-10">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-gray-200" />

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm">{comment.authorName ?? 'Unknown'}</div>
            <div className="text-xs text-gray-400">{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}</div>
          </div>

          {editing ? (
            <>
              <textarea className="w-full border rounded p-1 mt-2" value={editText} onChange={(e) => setEditText(e.target.value)} />
              <div className="flex gap-2 mt-2">
                <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={saveEdit}>Save</button>
                <button className="px-2 py-1 border rounded" onClick={() => { setEditing(false); setEditText(comment.content); }}>Cancel</button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
          )}

          <div className="flex gap-4 text-xs text-gray-500 mt-1">
            <button className="hover:underline" onClick={() => setShowReplyBox((s) => !s)}>Reply</button>

            {String(currentUserId) === String(comment.authorId) && !editing && (
              <button className="hover:underline" onClick={() => setEditing(true)}>Edit</button>
            )}

            {String(currentUserId) === String(comment.authorId) && (
              <button disabled={loadingDelete} onClick={deleteComment} className="text-red-500">
                {loadingDelete ? 'Deleting…' : 'Delete'}
              </button>
            )}
          </div>

          {/* replies */}
          <div className="mt-3 space-y-2">
            {(comment.replies || []).map((r: UIReply) => {
              const replyId = String(r._id ?? (r as any).id ?? '');
              return (
                <div key={replyId} className="pl-6">
                  <div className="flex items-start gap-2">
                    <div className="h-7 w-7 rounded-full bg-gray-100" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{r.authorName ?? 'Unknown'}</div>
                        <div className="text-xs text-gray-400">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
                      </div>

                      <ReplyRow
                        reply={r}
                        currentUserId={currentUserId}
                        onEdit={editReply}
                        onDelete={deleteReply}
                        commentAuthorId={comment.authorId}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* reply box */}
          {showReplyBox && (
            <div className="mt-2">
              <textarea className="w-full border rounded p-2" rows={2} placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
              <div className="flex justify-end gap-2 mt-2">
                <button className="px-3 py-1 border rounded" onClick={() => { setShowReplyBox(false); setReplyText(''); }}>Cancel</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={submitReply} disabled={loadingReply}>{loadingReply ? 'Replying...' : 'Reply'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Inline small component to manage per-reply edit/delete UI */
function ReplyRow({
  reply,
  currentUserId,
  onEdit,
  onDelete,
  commentAuthorId,
}: {
  reply: any;
  currentUserId: string;
  onEdit: (replyId: string, newContent: string) => Promise<void>;
  onDelete: (replyId: string) => Promise<void>;
  commentAuthorId?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(reply.content);

  const canEdit = String(currentUserId) === String(reply.authorId);
  const canDelete = canEdit || String(currentUserId) === String(commentAuthorId);

  const save = async () => {
    await onEdit(String(reply._id ?? (reply as any).id ?? ''), text);
    setEditing(false);
  };

  return (
    <>
      {editing ? (
        <>
          <textarea className="w-full border rounded p-1 mt-1" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="flex gap-2 mt-1">
            <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={save}>Save</button>
            <button className="px-2 py-1 border rounded" onClick={() => { setEditing(false); setText(reply.content); }}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
          <div className="flex gap-3 text-xs text-gray-500 mt-1">
            {canEdit && <button className="hover:underline" onClick={() => setEditing(true)}>Edit</button>}
            {canDelete && <button className="text-red-500" onClick={() => onDelete(String(reply._id ?? (reply as any).id ?? ''))}>Delete</button>}
          </div>
        </>
      )}
    </>
  );
}
