import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import Layout from '../components/layout/Layout';
import Badge from '../components/common/Badge';
import { SectionLoader } from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function MyCoursesPage() {
  const { user } = useAuth();
  const { courses, coursesLoading, coursesError, fetchCourses, refreshCourseProgress, fetchLesson } = useCourse();
  const navigate = useNavigate();

  const [progressMap, setProgressMap] = useState({});
  const [progressLoading, setProgressLoading] = useState(false);
  const [lastLesson, setLastLesson] = useState(null);
  const [lastLessonCourse, setLastLessonCourse] = useState(null);

  useEffect(() => {
    if (!courses.length) return;
    loadProgress();
  }, [courses]);

  const loadProgress = async () => {
    setProgressLoading(true);
    const results = await Promise.all(
      courses.map(async (c) => {
        const p = await refreshCourseProgress(c.id); // always fetch fresh — bypasses cache
        return [c.id, p];
      }),
    );
    setProgressMap(Object.fromEntries(results));
    setProgressLoading(false);
  };

  const courseWithLastLesson = courses.find((c) => progressMap[c.id]?.last_lesson_id);
  const lastLessonId = courseWithLastLesson ? progressMap[courseWithLastLesson.id]?.last_lesson_id : null;

  useEffect(() => {
    if (!lastLessonId) { setLastLesson(null); setLastLessonCourse(null); return; }
    fetchLesson(lastLessonId)
      .then((l) => { setLastLesson(l); setLastLessonCourse(courseWithLastLesson); })
      .catch(() => { setLastLesson(null); setLastLessonCourse(null); });
  }, [lastLessonId]);

  if (coursesLoading || progressLoading) return <Layout><SectionLoader message="Loading your courses..." /></Layout>;
  if (coursesError) return <Layout><ErrorMessage message={coursesError} onRetry={fetchCourses} /></Layout>;

  // Aggregate stats
  const totalCompleted = courses.reduce((sum, c) => {
    return sum + (progressMap[c.id]?.completed_lesson_ids?.length ?? 0);
  }, 0);
  const totalLessons = courses.reduce((sum, c) => sum + (c.total_lessons ?? 0), 0);
  const avgProgress = courses.length
    ? Math.round(courses.reduce((sum, c) => sum + (progressMap[c.id]?.progress_percentage ?? 0), 0) / courses.length)
    : 0;

  return (
    <Layout>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-textDark brand-heading">My Courses</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Welcome back, {user?.first_name || user?.username}. Keep up the great work!
        </p>
      </div>

      {/* Stats bar */}
      {courses.length > 0 && (
        <div className="flex flex-wrap gap-6 mb-8 px-1">
          <StatItem
            label="Enrolled"
            value={courses.length}
            icon={<BookIcon />}
          />
          <div className="w-px bg-[#F0E8E5] self-stretch" />
          <StatItem
            label="Lessons done"
            value={`${totalCompleted} / ${totalLessons}`}
            icon={<CheckIcon />}
          />
          <div className="w-px bg-[#F0E8E5] self-stretch" />
          <StatItem
            label="Avg. progress"
            value={`${avgProgress}%`}
            icon={<TrendIcon />}
          />
        </div>
      )}

      {/* Continue learning banner */}
      {lastLessonId && lastLesson && (
        <div className="mb-8 bg-secondary rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/70 font-medium mb-0.5">Continue where you left off</p>
              <p className="text-sm font-semibold text-white truncate">{lastLesson.title}</p>
              {lastLessonCourse && (
                <p className="text-xs text-white/60 truncate mt-0.5">{lastLessonCourse.title}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate(`/lessons/${lastLessonId}`)}
            className="shrink-0 px-4 py-2 bg-white text-secondary text-sm font-semibold rounded-xl hover:bg-accent transition-colors"
          >
            Resume →
          </button>
        </div>
      )}

      {/* Course grid */}
      {courses.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
            <BookIcon large />
          </div>
          <p className="font-semibold text-textDark mb-1">No courses yet</p>
          <p className="text-sm text-gray-400">Check back soon or contact your admin.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const progress = progressMap[course.id];
            const pct = progress?.progress_percentage ?? 0;
            const completedCount = progress?.completed_lesson_ids?.length ?? 0;
            const total = course.total_lessons ?? 0;
            const lastId = progress?.last_lesson_id;

            let statusVariant = 'gray';
            let statusLabel = 'Not started';
            if (pct === 100) { statusVariant = 'success'; statusLabel = 'Completed'; }
            else if (pct > 0) { statusVariant = 'default'; statusLabel = 'In progress'; }

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-[#F0E8E5] overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="relative h-32 bg-accent overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                  </div>
                </div>

                {/* Card body */}
                <div className="flex flex-col flex-1 p-4">
                  <h2 className="font-semibold text-textDark text-base mb-1 leading-snug line-clamp-2">
                    {course.title}
                  </h2>
                  <p className="text-xs text-gray-400 mb-4">
                    {course.module_count ?? 0} {(course.module_count ?? 0) === 1 ? 'Module' : 'Modules'} • {total} {total === 1 ? 'Lesson' : 'Lessons'}
                  </p>

                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-gray-500">{completedCount} of {total} lessons done</span>
                      <span className="text-xs font-semibold text-secondary">{pct}%</span>
                    </div>
                    <div className="w-full bg-accent rounded-full h-2 mb-4">
                      <div
                        className="bg-secondary rounded-full h-2 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex gap-2">
                      {pct === 100 ? (
                        <>
                          <button
                            onClick={() => navigate(`/courses/${course.id}`)}
                            className="flex-1 px-3 py-2 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors"
                          >
                            Review Course
                          </button>
                          <button
                            disabled
                            className="flex-1 px-3 py-2 rounded-xl border border-[#E5DDD9] text-sm font-medium text-gray-400 cursor-not-allowed opacity-60"
                          >
                            View Certificate
                          </button>
                        </>
                      ) : (
                        <>
                          {total > 0 && (
                            <button
                              onClick={() => navigate(lastId ? `/lessons/${lastId}` : `/courses/${course.id}`)}
                              className="flex-1 px-3 py-2 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors"
                            >
                              {pct > 0 ? 'Resume Course' : 'Start Course'}
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/courses/${course.id}`)}
                            className="flex-1 px-3 py-2 rounded-xl border border-[#E5DDD9] text-sm font-medium text-textDark hover:bg-background transition-colors"
                          >
                            View Details
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}

function StatItem({ label, value, icon }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-secondary shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-base font-bold text-textDark leading-none">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function BookIcon({ large = false }) {
  const cls = large ? 'w-8 h-8 text-secondary' : 'w-4 h-4';
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={large ? 1.5 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
