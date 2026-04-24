import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { SectionLoader } from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function CoursePage() {
  const { courseId } = useParams();
  const { fetchCourse, fetchCourseProgress } = useCourse();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModules, setOpenModules] = useState({});

  useEffect(() => {
    load();
  }, [courseId]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseData, progressData] = await Promise.all([
        fetchCourse(courseId),
        fetchCourseProgress(courseId),
      ]);
      setCourse(courseData);
      setProgress(progressData);
      // Open first module by default
      if (courseData.modules?.length > 0) {
        setOpenModules({ [courseData.modules[0].id]: true });
      }
    } catch (err) {
      setError('Failed to load course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (id) =>
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <Layout><SectionLoader message="Loading course..." /></Layout>;
  if (error) return <Layout><ErrorMessage message={error} onRetry={load} /></Layout>;
  if (!course) return null;

  const completedIds = progress?.completed_lesson_ids ?? [];
  const progressPct = progress?.progress_percentage ?? 0;
  const lastLessonId = progress?.last_lesson_id;
  const totalLessons = course.modules?.reduce((a, m) => a + (m.lessons?.length ?? 0), 0) ?? 0;
  const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id;

  // Attorney Insights — shown after course completion (static placeholder until backend is ready)
  const ATTORNEY_INSIGHTS = [
    {
      id: 1,
      name: 'Coming Soon',
      title: 'Personal Injury Attorney, CA',
      caption: 'Why Attention to Detail Matters',
      duration: '~30 sec',
    },
    {
      id: 2,
      name: 'Coming Soon',
      title: 'Paralegal Supervisor, TX',
      caption: 'What Law Firms Look for in Pre-Litigation Staff',
      duration: '~45 sec',
    },
    {
      id: 3,
      name: 'Coming Soon',
      title: 'Personal Injury Attorney, FL',
      caption: 'How to Handle Intake Like a Pro',
      duration: '~25 sec',
    },
  ];

  return (
    <Layout>
      {/* Back nav */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mb-4 -ml-2">
        ← Back to Dashboard
      </Button>

      {/* Course header */}
      <div className="bg-white rounded-2xl border border-[#F0E8E5] p-6 flex flex-col md:flex-row md:items-center gap-6 mb-8">
        <div className="flex-1">
          <Badge variant="default" className="mb-3">{course.module_count} Modules</Badge>
          <h1 className="text-xl font-bold text-textDark mb-2 brand-heading">{course.title}</h1>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">{course.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span>📚 {totalLessons} Lessons</span>
            <span>✅ {completedIds.length} Completed</span>
          </div>
        </div>
        <div className="md:w-56 shrink-0">
          <ProgressBar value={progressPct} size="md" className="mb-3" />
          <Button
            variant="primary"
            size="md"
            className="w-full"
            disabled={!lastLessonId && !firstLessonId}
            onClick={() => {
              const target = lastLessonId || firstLessonId;
              if (target) navigate(`/lessons/${target}`);
            }}
          >
            {progressPct > 0 ? '▶ Resume Course' : '▶ Start Course'}
          </Button>
          {!lastLessonId && !firstLessonId && (
            <p className="text-xs text-gray-400 text-center mt-2">No lessons available yet.</p>
          )}
        </div>
      </div>

      {/* Attorney Insights — visible only after course completion */}
      {progressPct === 100 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary text-base shrink-0">⚖️</div>
            <div>
              <h2 className="text-base font-bold text-textDark">Insights from Practicing Attorneys</h2>
              <p className="text-xs text-gray-400 mt-0.5">Bonus content — not required to complete the course.</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-4 ml-11">
            These insights are shared for educational purposes to help students understand real-world expectations in legal environments.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ATTORNEY_INSIGHTS.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-[#F0E8E5] overflow-hidden">
                {/* Video placeholder */}
                <div className="h-36 bg-gradient-to-br from-accent to-accent/40 flex flex-col items-center justify-center gap-2 relative">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="text-xs text-secondary/60 font-medium">{item.duration}</span>
                  <div className="absolute top-3 right-3 bg-white/80 text-secondary text-xs font-semibold px-2 py-0.5 rounded-full">
                    Coming Soon
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <p className="text-sm font-semibold text-textDark leading-snug mb-1">{item.caption}</p>
                  <p className="text-xs font-medium text-secondary">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modules */}
      <h2 className="text-base font-semibold text-textDark mb-4">Course Content</h2>
      <div className="space-y-3">
        {course.modules?.map((module) => {
          const doneLessons = (module.lessons || []).filter((l) => completedIds.includes(l.id)).length;
          const isOpen = !!openModules[module.id];

          return (
            <div key={module.id} className="bg-white rounded-2xl border border-[#F0E8E5] overflow-hidden">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-background transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-secondary font-semibold text-sm shrink-0">
                    {module.order}
                  </div>
                  <div>
                    <p className="font-medium text-textDark text-sm">{module.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {module.lessons?.length ?? 0} lessons · {doneLessons}/{module.lessons?.length ?? 0} complete
                    </p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="border-t border-[#F0E8E5]">
                  {(module.lessons || []).map((lesson, idx) => {
                    const isCompleted = completedIds.includes(lesson.id);
                    const isLast = lastLessonId === lesson.id;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => lesson.id && navigate(`/lessons/${lesson.id}`)}
                        disabled={!lesson.id}
                        className={`w-full flex items-center gap-4 px-6 py-3.5 text-left hover:bg-background transition-colors border-b border-[#F0E8E5] last:border-0 disabled:opacity-50 disabled:cursor-not-allowed ${isLast ? 'bg-accent/20' : ''}`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-medium ${
                          isCompleted
                            ? 'bg-secondary text-white'
                            : 'bg-accent text-secondary border border-secondary/20'
                        }`}>
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-textDark truncate">{lesson.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                            {lesson.duration && <span>▶ {lesson.duration}</span>}
                            {isLast && <span className="text-secondary font-medium">· Last viewed</span>}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
