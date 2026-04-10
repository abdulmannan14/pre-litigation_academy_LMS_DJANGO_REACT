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
  const { fetchLesson, fetchCourseProgress, markComplete, savePosition, videoPositions } = useCourse();

  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(false);

  // For prev/next navigation we need the full course structure
  const [allLessons, setAllLessons] = useState([]);
  const currentVideoPosition = useRef(0);

  useEffect(() => {
    load();
  }, [lessonId]);

  const load = async () => {
    setLoading(true);
    setError(null);
    setMarked(false);
    try {
      // Load lesson
      const lessonData = await fetchLesson(lessonId);
      setLesson(lessonData);

      // Try to load quiz (not all lessons have one)
      try {
        const { data } = await getQuiz(lessonId);
        setQuiz(data);
      } catch {
        setQuiz(null);
      }

      // This lesson belongs to a course via module — we need course_id for progress
      // The lesson API returns module info — fetch progress using the course
      // We'll load progress after we identify the course
    } catch (err) {
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

  const handleQuizComplete = async (score, total) => {
    // Mark lesson complete when quiz is submitted
    if (!marked) await handleMarkComplete();
  };

  if (loading) return <Layout><SectionLoader message="Loading lesson..." /></Layout>;
  if (error || !lesson) return <Layout><ErrorMessage message={error || 'Lesson not found.'} onRetry={load} /></Layout>;

  const savedPosition = videoPositions[Number(lessonId)] || 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4 flex-wrap">
          <button onClick={() => navigate('/dashboard')} className="hover:text-secondary transition-colors">
            Dashboard
          </button>
          <span>/</span>
          <span className="text-textDark font-medium truncate">{lesson.title}</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {lesson.duration && <Badge variant="gray">⏱ {lesson.duration}</Badge>}
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
          url={lesson.video_url}
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

        {/* Quiz */}
        {quiz ? (
          <QuizSection
            quiz={quiz}
            lessonId={lesson.id}
            onComplete={handleQuizComplete}
          />
        ) : (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center text-sm text-gray-400">
            No quiz for this lesson.
          </div>
        )}

        {/* Lesson navigation */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <Button variant="outline" size="md" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <Button variant="ghost" size="md" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
          {marked && quiz && (
            <Button variant="primary" size="md" onClick={() => navigate('/dashboard')}>
              Continue →
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
