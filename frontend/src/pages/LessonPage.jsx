import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { getQuiz } from '../api/quizApi';
import Layout from '../components/layout/Layout';
import VideoPlayer from '../components/lesson/VideoPlayer';
import QuizSection from '../components/quiz/QuizSection';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { SectionLoader } from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';

// Debounce helper — saves video position at most every 10 seconds
function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback(
    (...args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  );
}

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { fetchLesson, fetchCourse, fetchCourseProgress, markComplete, savePosition, videoPositions } = useCourse();

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(false);
  const [allLessons, setAllLessons] = useState([]);
  const currentVideoPosition = useRef(0);

  useEffect(() => {
    load();
  }, [lessonId]);

  const load = async () => {
    setLoading(true);
    setError(null);
    setMarked(false);
    setCourse(null);
    setAllLessons([]);
    try {
      const lessonData = await fetchLesson(lessonId);
      setLesson(lessonData);

      // Fetch course to build prev/next navigation and breadcrumb
      const courseId = lessonData.module?.course;
      if (courseId) {
        const courseData = await fetchCourse(courseId);
        setCourse(courseData);
        // Build flat ordered list of all lessons across all modules
        const flat = [];
        (courseData.modules || []).forEach((m) => {
          (m.lessons || []).forEach((l) => flat.push(l));
        });
        setAllLessons(flat);
      }

      // Try to load quiz (not all lessons have one)
      try {
        const { data } = await getQuiz(lessonId);
        setQuiz(data);
      } catch {
        setQuiz(null);
      }
    } catch {
      setError('Failed to load lesson.');
    } finally {
      setLoading(false);
    }
  };

  // Save video position with debounce (every 10 s)
  const debouncedSave = useDebounce(
    (seconds) => savePosition(Number(lessonId), seconds),
    10000,
  );

  const handleVideoProgress = (seconds) => {
    currentVideoPosition.current = seconds;
    debouncedSave(seconds);
  };

  const handleMarkComplete = async () => {
    if (marking || marked) return;
    setMarking(true);
    try {
      await markComplete(Number(lessonId), lesson?.module?.course ?? 0, currentVideoPosition.current);
      setMarked(true);
    } finally {
      setMarking(false);
    }
  };

  const handleQuizComplete = async () => {
    if (!marked) await handleMarkComplete();
  };

  if (loading) return <Layout><SectionLoader message="Loading lesson..." /></Layout>;
  if (error || !lesson) return <Layout><ErrorMessage message={error || 'Lesson not found.'} onRetry={load} /></Layout>;

  const savedPosition = videoPositions[Number(lessonId)] || 0;
  const currentIndex = allLessons.findIndex((l) => l.id === Number(lessonId));
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1
    ? allLessons[currentIndex + 1]
    : null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4 flex-wrap">
          <button onClick={() => navigate('/dashboard')} className="hover:text-secondary transition-colors">
            Dashboard
          </button>
          {course && (
            <>
              <span>/</span>
              <button
                onClick={() => navigate(`/courses/${course.id}`)}
                className="hover:text-secondary transition-colors truncate max-w-[180px]"
              >
                {course.title}
              </button>
            </>
          )}
          <span>/</span>
          <span className="text-textDark font-medium truncate max-w-[200px]">{lesson.title}</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {lesson.duration && <Badge variant="gray">⏱ {lesson.duration}</Badge>}
              {currentIndex >= 0 && allLessons.length > 0 && (
                <Badge variant="default">Lesson {currentIndex + 1} of {allLessons.length}</Badge>
              )}
              {marked && <Badge variant="success">✓ Completed</Badge>}
            </div>
            <h1 className="text-xl font-bold text-textDark">{lesson.title}</h1>
          </div>
          {!marked && (
            <Button
              onClick={handleMarkComplete}
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={marking}
            >
              {marking ? 'Saving...' : 'Mark Complete'}
            </Button>
          )}
        </div>

        {/* Video Player */}
        <VideoPlayer
          url={lesson.video || lesson.video_url}
          lessonId={lesson.id}
          savedPosition={savedPosition}
          onProgress={handleVideoProgress}
        />

        {/* Description */}
        {lesson.description && (
          <div className="mt-6 bg-white rounded-2xl border border-[#F0E8E5] p-6">
            <h2 className="font-semibold text-textDark mb-2">About this lesson</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{lesson.description}</p>
          </div>
        )}

        {/* Quiz — only visible after marking complete */}
        {quiz && !marked && (
          <div className="mt-8 rounded-2xl border border-[#F0E8E5] bg-white overflow-hidden">
            <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <p className="font-semibold text-textDark">Quiz locked</p>
              <p className="text-sm text-gray-500">Mark this lesson as complete to unlock the quiz.</p>
              <button
                onClick={handleMarkComplete}
                disabled={marking}
                className="mt-1 px-5 py-2 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors disabled:opacity-60"
              >
                {marking ? 'Saving...' : 'Mark as Complete & Unlock Quiz'}
              </button>
            </div>
          </div>
        )}
        {quiz && marked && (
          <QuizSection
            quiz={quiz}
            lessonId={lesson.id}
            onComplete={handleQuizComplete}
          />
        )}
        {!quiz && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center text-sm text-gray-400">
            No quiz for this lesson.
          </div>
        )}

        {/* Lesson navigation */}
        <div className="mt-8 flex items-center justify-between gap-4">
          {/* Left: prev or back to course */}
          <Button
            variant="outline"
            size="md"
            onClick={() =>
              prevLesson
                ? navigate(`/lessons/${prevLesson.id}`)
                : navigate(course ? `/courses/${course.id}` : '/dashboard')
            }
          >
            ← {prevLesson ? 'Previous Lesson' : 'Back to Course'}
          </Button>

          {/* Right: next lesson (always visible) or finish */}
          {nextLesson ? (
            <Button
              variant={marked ? 'primary' : 'ghost'}
              size="md"
              onClick={() => navigate(`/lessons/${nextLesson.id}`)}
            >
              Next Lesson →
            </Button>
          ) : (
            <Button
              variant={marked ? 'primary' : 'ghost'}
              size="md"
              onClick={() => navigate('/dashboard')}
            >
              {marked ? 'Finish Course ✓' : 'Dashboard'}
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
