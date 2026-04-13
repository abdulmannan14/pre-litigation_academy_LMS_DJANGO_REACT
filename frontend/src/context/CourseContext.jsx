import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as courseApi from '../api/courseApi';
import * as progressApi from '../api/progressApi';

const CourseContext = createContext(null);

export function CourseProvider({ children }) {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState(null);

  // Per-course progress cache: { [courseId]: { progress_percentage, last_lesson_id, completed_lesson_ids } }
  const [progressCache, setProgressCache] = useState({});
  // Per-lesson cache: { [lessonId]: lessonData }
  const [lessonCache, setLessonCache] = useState({});
  // Video positions (local, synced to backend): { [lessonId]: seconds }
  const [videoPositions, setVideoPositions] = useState({});

  // ── Load courses when user logs in ──────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setCourses([]);
      setProgressCache({});
      setLessonCache({});
      return;
    }
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const { data } = await courseApi.getCourses();
      const list = data.results ?? data;
      setCourses(list);
      // Auto-enroll in all published courses if student
      if (user && !user.is_staff) {
        list.forEach((course) => {
          progressApi.enrollInCourse(course.id).catch(() => {});
        });
      }
    } catch (err) {
      setCoursesError('Failed to load courses.');
    } finally {
      setCoursesLoading(false);
    }
  };

  // ── Get single course (with modules) ────────────────────────────────────────
  const fetchCourse = useCallback(async (id) => {
    const { data } = await courseApi.getCourse(id);
    return data;
  }, []);

  // ── Get lesson (with cache) ──────────────────────────────────────────────────
  const fetchLesson = useCallback(async (id) => {
    if (lessonCache[id]) return lessonCache[id];
    const { data } = await courseApi.getLesson(id);
    setLessonCache((prev) => ({ ...prev, [id]: data }));
    return data;
  }, [lessonCache]);

  // ── Get course progress (with cache) ────────────────────────────────────────
  const fetchCourseProgress = useCallback(async (courseId) => {
    if (progressCache[courseId]) return progressCache[courseId];
    try {
      const { data } = await progressApi.getCourseProgress(courseId);
      setProgressCache((prev) => ({ ...prev, [courseId]: data }));
      return data;
    } catch {
      // Not enrolled yet — return empty state
      return { progress_percentage: 0, last_lesson_id: null, completed_lesson_ids: [] };
    }
  }, [progressCache]);

  const refreshCourseProgress = useCallback(async (courseId) => {
    try {
      const { data } = await progressApi.getCourseProgress(courseId);
      setProgressCache((prev) => ({ ...prev, [courseId]: data }));
      return data;
    } catch {
      return { progress_percentage: 0, last_lesson_id: null, completed_lesson_ids: [] };
    }
  }, []);

  // ── Mark lesson complete ─────────────────────────────────────────────────────
  const markComplete = useCallback(async (lessonId, courseId, videoPosition = 0) => {
    await progressApi.markLessonComplete(lessonId, videoPosition);
    await refreshCourseProgress(courseId);
  }, [refreshCourseProgress]);

  // ── Save video position (debounced by caller) ────────────────────────────────
  const savePosition = useCallback(async (lessonId, seconds) => {
    setVideoPositions((prev) => ({ ...prev, [lessonId]: seconds }));
    try {
      await progressApi.saveVideoPosition(lessonId, seconds);
    } catch (_) {}
  }, []);

  return (
    <CourseContext.Provider
      value={{
        courses,
        coursesLoading,
        coursesError,
        fetchCourses,
        fetchCourse,
        fetchLesson,
        fetchCourseProgress,
        refreshCourseProgress,
        markComplete,
        savePosition,
        videoPositions,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  return useContext(CourseContext);
}
