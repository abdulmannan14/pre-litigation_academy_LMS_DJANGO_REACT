import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { mockCourses, mockProgress } from '../../data/mockData';

const stats = [
  { label: 'Total Courses', value: mockCourses.length, icon: '📚', trend: '+1 this month' },
  { label: 'Total Students', value: 24, icon: '👥', trend: '+3 this week' },
  { label: 'Lessons Published', value: mockCourses.reduce((a, c) => a + c.modules.reduce((b, m) => b + m.lessons.length, 0), 0), icon: '🎬', trend: 'All active' },
  { label: 'Quiz Completion', value: '72%', icon: '📝', trend: 'Avg. score 81%' },
];

const recentActivity = [
  { user: 'Sarah Johnson', action: 'Completed Lesson 2', time: '2 mins ago', type: 'success' },
  { user: 'Mark Williams', action: 'Submitted Quiz — Lesson 1', time: '15 mins ago', type: 'success' },
  { user: 'Emily Chen', action: 'Started course', time: '1 hour ago', type: 'default' },
  { user: 'James Torres', action: 'Failed Quiz — Lesson 3', time: '2 hours ago', type: 'danger' },
  { user: 'Aisha Patel', action: 'Completed Module 1', time: '3 hours ago', type: 'success' },
];

export default function AdminOverviewPage() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-textDark">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="!p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-textDark">{s.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                <p className="text-xs text-secondary mt-1">{s.trend}</p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Course progress */}
        <Card>
          <h2 className="font-semibold text-textDark mb-4">Course Overview</h2>
          <div className="space-y-4">
            {mockCourses.map((course) => (
              <div key={course.id} className="p-3 bg-background rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-textDark pr-4 leading-snug">{course.title}</p>
                  <Badge variant="success" className="shrink-0">Active</Badge>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>{course.modules.length} modules</span>
                  <span>{course.totalLessons} lessons</span>
                  <span>{course.totalDuration}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent activity */}
        <Card>
          <h2 className="font-semibold text-textDark mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-secondary shrink-0">
                  {item.user.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-textDark">{item.user}</p>
                  <p className="text-xs text-gray-400">{item.action}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant={item.type}>{item.time}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
