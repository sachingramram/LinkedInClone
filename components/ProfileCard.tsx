export default function ProfileCard(){
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <div className="mx-auto h-20 w-20 rounded-full bg-gray-200" />
      <h3 className="mt-3 font-semibold">Sachin Pal</h3>
      <p className="text-sm text-gray-500">Full-stack Developer</p>
      <div className="mt-4">
        <button className="px-3 py-1 text-sm rounded-md border">Open to</button>
      </div>
    </div>
  );
}
