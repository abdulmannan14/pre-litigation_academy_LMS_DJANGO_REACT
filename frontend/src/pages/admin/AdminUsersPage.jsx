import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

const mockUsers = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'student', progress: 22, joined: 'Mar 10, 2026', status: 'active' },
  { id: 2, name: 'Mark Williams', email: 'mark@example.com', role: 'student', progress: 55, joined: 'Mar 12, 2026', status: 'active' },
  { id: 3, name: 'Emily Chen', email: 'emily@example.com', role: 'student', progress: 11, joined: 'Mar 18, 2026', status: 'active' },
  { id: 4, name: 'James Torres', email: 'james@example.com', role: 'student', progress: 78, joined: 'Feb 28, 2026', status: 'active' },
  { id: 5, name: 'Aisha Patel', email: 'aisha@example.com', role: 'student', progress: 100, joined: 'Feb 15, 2026', status: 'completed' },
  { id: 6, name: 'Liam Nguyen', email: 'liam@example.com', role: 'student', progress: 33, joined: 'Apr 1, 2026', status: 'active' },
];

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-textDark">Users</h1>
        <p className="text-sm text-gray-500 mt-1">All enrolled students and their progress.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-textDark">{mockUsers.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Students</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-textDark">
            {mockUsers.filter((u) => u.status === 'active').length}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Active</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-textDark">
            {mockUsers.filter((u) => u.status === 'completed').length}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Completed</p>
        </Card>
      </div>

      {/* Users table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0E8E5] bg-background">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Progress</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E8E5]">
              {mockUsers.map((user) => {
                const initials = user.name.split(' ').map((n) => n[0]).join('');
                return (
                  <tr key={user.id} className="hover:bg-background transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-secondary shrink-0">
                          {initials}
                        </div>
                        <span className="font-medium text-textDark">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-accent rounded-full h-1.5">
                          <div
                            className="bg-secondary h-1.5 rounded-full"
                            style={{ width: `${user.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{user.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{user.joined}</td>
                    <td className="px-6 py-4">
                      <Badge variant={user.status === 'completed' ? 'success' : 'default'}>
                        {user.status === 'completed' ? 'Completed' : 'Active'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
