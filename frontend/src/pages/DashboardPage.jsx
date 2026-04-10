import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { SectionLoader } from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function DashboardPage() {
  const { user } = useAuth();
  const { courses, coursesLoading, coursesError, fetchCourses, fetchCourseProgress } = useCourse();
  const navigate = useNavigate();

  const [progressMap, setProgressMap] = useState({}); // { [courseId]: progressData }
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    if (!courses.length) return;
    loadProgress();
  }, [courses]);

  const loadProgress = async () => {
    setProgressLoading(true);
    const results = await Promise.all(
      courses.map(async (c) => {
        const p = await fetchCourseProgress(c.id);
        return [c.id, p];
      }),
    );
    setProgressMap(Object.fromEntries(results));
    setProgressLoading(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (coursesLoading || progressLoading) return <Layout><SectionLoader message="Loading your dashboard..." /></Layout>;
  if (coursesError) return <Layout><ErrorMessage message={coursesError} onRetry={fetchCourses} /></Layout>;

  // Use first course for the main card
  const course = courses[0];
  const progress = course ? progressMap[course.id] : null;
  const progressPct = progress?.progress_percentage ?? 0;
  const completedIds = progress?.completed_lesson_ids ?? [];
  const lastLessonId = progress?.last_lesson_id;
  const totalLessons = course?.total_lessons ?? 0;
  const quizAttempts = 0; // fetched separately if needed

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-textDark">
          {greeting()}, {user?.first_name || user?.username} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Continue where you left off.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Course Progress" value={`${progressPct}%`} icon="📈" />
        <StatCard label="Lessons Done" value={`${completedIds.length}/${totalLessons}`} icon="✅" />
        <StatCard label="Enrolled Courses" value={courses.length} icon="📚" />
        <StatCard label="Status" value={progressPct === 100 ? 'Done!' : 'Active'} icon="🎯" />
      </div>

      {courses.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-4xl mb-3">📚</p>
          <p className="font-medium text-textDark">No courses available yet.</p>
          <p className="text-sm text-gray-400 mt-1">Check back soon or contact your admin.</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Course progress card */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-textDark">{course.title}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {course.module_count} modules · {totalLessons} lessons
                  </p>
                </div>
                <Badge variant={progressPct === 100 ? 'success' : 'default'}>
                  {progressPct === 100 ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
              <ProgressBar value={progressPct} size="md" className="mb-6" />

              <div className="mt-6 flex gap-3 flex-wrap">
                <Button onClick={() => navigate(`/courses/${course.id}`)} variant="primary">
                  View Course
                </Button>
                {lastLessonId && (
                  <Button onClick={() => navigate(`/lessons/${lastLessonId}`)} variant="outline">
                    Resume Lesson
                  </Button>
                )}
              </div>
            </Card>

            {/* All courses list */}
            {courses.length > 1 && (
              <Card>
                <h2 className="font-semibold text-textDark mb-4">All Courses</h2>
                <div className="space-y-3">
                  {courses.map((c) => {
                    const p = progressMap[c.id];
                    const pct = p?.progress_percentage ?? 0;
                    return (
                      <div
                        key={c.id}
                        onClick={() => navigate(`/courses/${c.id}`)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-background cursor-pointer transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-secondary text-lg shrink-0">
                          📚
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-textDark truncate">{c.title}</p>
                          <ProgressBar value={pct} showLabel={false} size="sm" className="mt-1" />
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {lastLessonId && (
              <Card>
                <h3 className="font-semibold text-textDark mb-3">Continue Learning</h3>
                <div className="bg-background rounded-xl p-4 mb-4">
                  <p className="text-xs text-secondary font-medium mb-1">Last viewed</p>
                  <p className="text-sm font-medium text-textDark">Lesson #{lastLessonId}</p>
                </div>
                <Button
                  onClick={() => navigate(`/lessons/${lastLessonId}`)}
                  variant="primary"
                  size="sm"
                  className="w-full"
                >
                  ▶ Resume
                </Button>
              </Card>
            )}

            <Card>
              <h3 className="font-semibold text-textDark mb-3">Your Progress</h3>
              <div className="space-y-3">
                {courses.map((c) => {
                  const p = progressMap[c.id];
                  const pct = p?.progress_percentage ?? 0;
                  return (
                    <div key={c.id} className="flex items-center justify-between p-2.5 bg-background rounded-lg">
                      <p className="text-xs text-textDark truncate flex-1 pr-2">{c.title}</p>
                      <Badge variant={pct === 100 ? 'success' : 'default'}>{pct}%</Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}
    </Layout>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <Card className="text-center !p-4">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-xl font-bold text-textDark">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </Card>
  );
}
