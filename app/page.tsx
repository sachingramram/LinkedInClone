import Feed from '@/components/Feed';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Header />
      <div className="grid grid-cols-12 gap-6 mt-6">
        <aside className="col-span-12 lg:col-span-3">
          <Sidebar />
        </aside>

        <main className="col-span-12 lg:col-span-6">
          <Feed/>
        </main>

        <div className="hidden lg:block col-span-3">
          <div className="sticky top-20">
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="font-medium text-gray-700">People you may know</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div>
                    <div className="font-semibold">Bill Gates</div>
                    <div className="text-sm text-gray-500">Microsoft Owner</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
