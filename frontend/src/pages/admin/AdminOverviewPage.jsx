import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { SectionLoader } from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { getAdminStats, getAdminStudents } from '../../api/progressApi';
import { getCourses } from '../../api/courseApi';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, studentsRes, coursesRes] = await Promise.all([
        getAdminStats(),
        getAdminStudents(),
        getCourses(),
      ]);
      setStats(statsRes.data);
      setRecentStudents((studentsRes.data || []).slice(0, 5));
      setCourses(coursesRes.data.results ?? coursesRes.data);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AdminLayout><SectionLoader message="Loading dashboard..." /></AdminLayout>;
  if (error) return <AdminLayout><ErrorMessage message={error} onRetry={load} /></AdminLayout>;

  const statCards = [
    { label: 'Total Students',   value: stats.total_students,      icon: '👥', sub: `${stats.total_enrollments} enrollments` },
    { label: 'Total Courses',    value: stats.total_courses,        icon: '📚', sub: 'Published & drafts' },
    { label: 'Total Lessons',    value: stats.total_lessons,        icon: '🎬', sub: 'Across all courses' },
    { label: 'Quiz Pass Rate',   value: `${stats.quiz_pass_rate}%`, icon: '📝', sub: `${stats.total_quiz_attempts} attempts` },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-textDark">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time snapshot of your platform.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.label} className="!p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-textDark">{s.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                <p className="text-xs text-secondary mt-1">{s.sub}</p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Courses */}
        <Card>
          <h2 className="font-semibold text-textDark mb-4">Courses</h2>
          {courses.length === 0 ? (
            <p className="text-sm text-gray-400">No courses yet.</p>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.id} className="p-3 bg-background rounded-xl">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-textDark pr-4 leading-snug truncate">{course.title}</p>
                    <Badge variant={course.is_published ? 'success' : 'gray'} className="shrink-0">
                      {course.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">
                    {course.module_count ?? 0} modules · {course.total_lessons ?? 0} lessons
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent students */}
        <Card>
          <h2 className="font-semibold text-textDark mb-4">Recent Students</h2>
          {recentStudents.length === 0 ? (
            <p className="text-sm text-gray-400">No students yet.</p>
          ) : (
            <div className="space-y-3">
              {recentStudents.map((student) => (
                <div key={student.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-secondary shrink-0">
                    {student.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-textDark truncate">{student.full_name || student.username}</p>
                    <p className="text-xs text-gray-400">{student.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-secondary">{student.avg_progress}%</p>
                    <p className="text-xs text-gray-400">{student.enrolled_courses} course{student.enrolled_courses !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
