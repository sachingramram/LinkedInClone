import ProfileCard from './ProfileCard';

export default function Sidebar() {
  return (
    <div className="space-y-4">
      <ProfileCard />
      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="font-medium">Your shortcuts</h4>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li>Groups</li>
          <li>Events</li>
          <li>Newsletters</li>
        </ul>
      </div>
    </div>
  );
}
