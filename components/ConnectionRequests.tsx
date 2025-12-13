'use client';

import useSWR from "swr";
import axios from "axios";

const fetcher = (url: string) => axios.get(url).then(r => r.data);

export default function ConnectionRequests() {
  const { data, mutate } = useSWR("/api/connections/pending", fetcher);

  const respond = async (id: string, status: "accepted" | "rejected") => {
    await axios.put(`/api/connections/${id}`, { status });
    mutate();
  };

  if (!data?.length) return null;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-3">Connection Requests</h3>

      {data.map((req: any) => (
        <div
          key={req._id}
          className="flex justify-between items-center mb-2"
        >
          <div className="flex items-center gap-3">
  <div className="h-10 w-10 rounded-full bg-gray-200" />
  <div>
    <p className="font-medium">{req.requesterName}</p>
    <p className="text-xs text-gray-500">wants to connect</p>
  </div>
</div>


          <div className="flex gap-2">
            <button
              onClick={() => respond(req._id, "accepted")}
              className="text-green-600 text-sm"
            >
              Accept
            </button>
            <button
              onClick={() => respond(req._id, "rejected")}
              className="text-red-600 text-sm"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
