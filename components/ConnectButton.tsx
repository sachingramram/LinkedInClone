'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

type Status = 'idle' | 'pending' | 'connected';

export default function ConnectButton({ userId }: { userId: string }) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<Status>('idle');
  const [loading, setLoading] = useState(false);

  // 🔄 Check existing connection status
  useEffect(() => {
    if (!session) return;

    const checkStatus = async () => {
      try {
        const res = await axios.get(`/api/connections/status/${userId}`);
        setStatus(res.data.status); // idle | pending | connected
      } catch {
        setStatus('idle');
      }
    };

    checkStatus();
  }, [session, userId]);

  // ➕ Send connection request
  const sendRequest = async () => {
    if (!session) return alert('Please sign in');

    try {
      setLoading(true);
      await axios.post('/api/connections/request', { userId });
      setStatus('pending');
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  // 🔒 Same user — no button
  if (session?.user?.id === userId) return null;

  // 🎯 BUTTON STATES
  if (status === 'connected') {
    return (
      <button
        disabled
        className="px-3 py-1 text-sm rounded-md bg-green-100 text-green-700 cursor-default"
      >
        Connected
      </button>
    );
  }

  if (status === 'pending') {
    return (
      <button
        disabled
        className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-500 cursor-default"
      >
        Pending
      </button>
    );
  }

  return (
    <button
      onClick={sendRequest}
      disabled={loading}
      className="px-3 py-1 text-sm rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-60"
    >
      {loading ? 'Sending...' : 'Connect'}
    </button>
  );
}
