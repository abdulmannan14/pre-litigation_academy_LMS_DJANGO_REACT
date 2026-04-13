import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import { SectionLoader } from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import * as courseApi from '../../api/courseApi';
import * as quizApi from '../../api/quizApi';

// ─── Shared helpers ────────────────────────────────────────────────────────────

function FieldRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function inputCls(error) {
  return `w-full px-3 py-2 rounded-xl border text-sm text-textDark bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${error ? 'border-red-400' : 'border-[#E5DDD9]'}`;
}

function SectionTitle({ children }) {
  return <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">{children}</p>;
}

// ─── Question Row ──────────────────────────────────────────────────────────────

function QuestionRow({ question, quizId, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    text: question.text,
    option_a: question.option_a ?? question.options?.[0]?.text ?? '',
    option_b: question.option_b ?? question.options?.[1]?.text ?? '',
    option_c: question.option_c ?? question.options?.[2]?.text ?? '',
    option_d: question.option_d ?? question.options?.[3]?.text ?? '',
    correct_answer: question.correct_answer ?? 'A',
    explanation: question.explanation ?? '',
    order: question.order ?? 1,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await quizApi.updateQuestion(question.id, { ...form, quiz: quizId });
      onUpdated(data);
      setEditing(false);
    } catch { } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this question?')) return;
    await quizApi.deleteQuestion(question.id);
    onDeleted(question.id);
  };

  if (!editing) {
    return (
      <div className="bg-background rounded-xl p-3 border border-[#F0E8E5]">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-textDark flex-1 leading-snug">
            <span className="font-semibold text-secondary mr-1">{question.order}.</span>
            {question.text}
          </p>
          <div className="flex gap-1 shrink-0">
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
            <Button size="sm" variant="danger" onClick={handleDelete}>Del</Button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {['A', 'B', 'C', 'D'].map((key) => {
            const text = form[`option_${key.toLowerCase()}`];
            const isCorrect = form.correct_answer === key;
            return (
              <span key={key} className={`text-xs px-2 py-0.5 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-300 text-green-700 font-semibold' : 'border-[#E5DDD9] text-gray-500'}`}>
                {key}: {text}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-secondary/30 p-4 space-y-3">
      <FieldRow label="Question text">
        <textarea
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
          rows={2}
          className={inputCls(false) + ' resize-none'}
        />
      </FieldRow>
      <div className="grid grid-cols-2 gap-3">
        {['A', 'B', 'C', 'D'].map((key) => (
          <FieldRow key={key} label={`Option ${key}`}>
            <input
              type="text"
              value={form[`option_${key.toLowerCase()}`]}
              onChange={(e) => setForm({ ...form, [`option_${key.toLowerCase()}`]: e.target.value })}
              className={inputCls(false)}
            />
          </FieldRow>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Correct Answer">
          <select
            value={form.correct_answer}
            onChange={(e) => setForm({ ...form, correct_answer: e.target.value })}
            className={inputCls(false)}
          >
            {['A', 'B', 'C', 'D'].map((k) => <option key={k}>{k}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Order">
          <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className={inputCls(false)} />
        </FieldRow>
      </div>
      <FieldRow label="Explanation">
        <textarea
          value={form.explanation}
          onChange={(e) => setForm({ ...form, explanation: e.target.value })}
          rows={2}
          className={inputCls(false) + ' resize-none'}
        />
      </FieldRow>
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
        <Button size="sm" variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>
    </div>
  );
}

// ─── Quiz Manager ──────────────────────────────────────────────────────────────

function QuizManager({ lessonId }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [qForm, setQForm] = useState({ text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '', order: 1 });
  const [savingQ, setSavingQ] = useState(false);

  useEffect(() => { fetchQuiz(); }, [lessonId]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const { data } = await quizApi.getQuiz(lessonId);
      setQuiz(data);
    } catch {
      setQuiz(null);
    } finally { setLoading(false); }
  };

  const handleCreateQuiz = async () => {
    setCreating(true);
    try {
      const { data } = await quizApi.createQuiz({ lesson: lessonId, title: '' });
      setQuiz({ ...data, questions: [] });
    } catch { } finally { setCreating(false); }
  };

  const handleDeleteQuiz = async () => {
    if (!window.confirm('Delete this quiz and all its questions?')) return;
    await quizApi.deleteQuiz(quiz.id);
    setQuiz(null);
  };

  const handleAddQuestion = async () => {
    setSavingQ(true);
    try {
      const nextOrder = (quiz.questions?.length ?? 0) + 1;
      const { data } = await quizApi.createQuestion({ ...qForm, quiz: quiz.id, order: nextOrder });
      setQuiz((prev) => ({ ...prev, questions: [...(prev.questions || []), data] }));
      setQForm({ text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '' });
      setAddingQuestion(false);
    } catch { } finally { setSavingQ(false); }
  };

  const handleQuestionUpdated = (updated) => {
    setQuiz((prev) => ({ ...prev, questions: prev.questions.map((q) => q.id === updated.id ? { ...q, ...updated } : q) }));
  };

  const handleQuestionDeleted = (id) => {
    setQuiz((prev) => ({ ...prev, questions: prev.questions.filter((q) => q.id !== id) }));
  };

  if (loading) return <p className="text-xs text-gray-400 py-2">Loading quiz...</p>;

  return (
    <div className="mt-3 pt-3 border-t border-[#F0E8E5]">
      <div className="flex items-center justify-between mb-3">
        <SectionTitle>Quiz</SectionTitle>
        {quiz && (
          <Button size="sm" variant="danger" onClick={handleDeleteQuiz}>Delete Quiz</Button>
        )}
      </div>

      {!quiz ? (
        <Button size="sm" variant="outline" onClick={handleCreateQuiz} disabled={creating}>
          {creating ? 'Creating...' : '+ Create Quiz'}
        </Button>
      ) : (
        <div className="space-y-2">
          {(quiz.questions || []).length === 0 && (
            <p className="text-xs text-gray-400">No questions yet.</p>
          )}
          {(quiz.questions || []).map((q) => (
            <QuestionRow
              key={q.id}
              question={q}
              quizId={quiz.id}
              onUpdated={handleQuestionUpdated}
              onDeleted={handleQuestionDeleted}
            />
          ))}

          {addingQuestion ? (
            <div className="bg-white rounded-xl border border-secondary/30 p-4 space-y-3 mt-2">
              <p className="text-xs font-semibold text-textDark">New Question</p>
              <FieldRow label="Question text">
                <textarea value={qForm.text} onChange={(e) => setQForm({ ...qForm, text: e.target.value })} rows={2} className={inputCls(false) + ' resize-none'} />
              </FieldRow>
              <div className="grid grid-cols-2 gap-3">
                {['A', 'B', 'C', 'D'].map((key) => (
                  <FieldRow key={key} label={`Option ${key}`}>
                    <input type="text" value={qForm[`option_${key.toLowerCase()}`]} onChange={(e) => setQForm({ ...qForm, [`option_${key.toLowerCase()}`]: e.target.value })} className={inputCls(false)} />
                  </FieldRow>
                ))}
              </div>
              <FieldRow label="Correct Answer">
                <select value={qForm.correct_answer} onChange={(e) => setQForm({ ...qForm, correct_answer: e.target.value })} className={inputCls(false)}>
                  {['A', 'B', 'C', 'D'].map((k) => <option key={k}>{k}</option>)}
                </select>
              </FieldRow>
              <FieldRow label="Explanation">
                <textarea value={qForm.explanation} onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })} rows={2} className={inputCls(false) + ' resize-none'} />
              </FieldRow>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setAddingQuestion(false)}>Cancel</Button>
                <Button size="sm" variant="primary" onClick={handleAddQuestion} disabled={savingQ}>{savingQ ? 'Adding...' : 'Add Question'}</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => { setAddingQuestion(true); setQForm((f) => ({ ...f, order: (quiz.questions?.length ?? 0) + 1 })); }}>
              + Add Question
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Lesson Row ────────────────────────────────────────────────────────────────

function LessonRow({ lesson, moduleId, index, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [form, setForm] = useState({
    title: lesson.title,
    description: lesson.description || '',
    video_url: lesson.video_url || '',
    duration: lesson.duration || '',
    order: lesson.order,
  });
  const [videoFile, setVideoFile] = useState(null);       // File object from picker
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const hasExistingFile = !!lesson.video_file;

  const handleSave = async () => {
    setSaving(true);
    setUploadProgress(0);
    try {
      const payload = { ...form, module: moduleId };
      if (videoFile) payload.video_file = videoFile;
      const { data } = await courseApi.updateLesson(lesson.id, payload);
      onUpdated(data);
      setEditing(false);
      setVideoFile(null);
    } catch { } finally { setSaving(false); setUploadProgress(0); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete lesson "${lesson.title}"?`)) return;
    await courseApi.deleteLesson(lesson.id);
    onDeleted(lesson.id);
  };

  return (
    <div className="rounded-xl border border-[#F0E8E5] overflow-hidden">
      {/* Lesson header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white">
        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-secondary shrink-0">{index + 1}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-textDark truncate">{lesson.title}</p>
          {lesson.duration && <p className="text-xs text-gray-400">⏱ {lesson.duration}</p>}
        </div>
        <div className="flex gap-1 shrink-0 flex-wrap justify-end">
          <Button size="sm" variant="ghost" onClick={() => { setEditing(!editing); setQuizOpen(false); }}>
            {editing ? 'Close' : 'Edit'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setQuizOpen(!quizOpen); setEditing(false); }}>
            {quizOpen ? 'Hide Quiz' : 'Quiz'}
          </Button>
          <Button size="sm" variant="danger" onClick={handleDelete}>Del</Button>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="px-4 py-4 bg-background border-t border-[#F0E8E5] space-y-3">
          <FieldRow label="Title">
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls(false)} />
          </FieldRow>
          <FieldRow label="Description">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputCls(false) + ' resize-none'} />
          </FieldRow>
          {/* Video upload */}
          <FieldRow label="Video File">
            <label className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-dashed ${videoFile ? 'border-secondary bg-accent/20' : 'border-[#E5DDD9] hover:border-secondary'} cursor-pointer transition-colors`}>
              <svg className="w-5 h-5 text-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm text-gray-600 truncate flex-1">
                {videoFile
                  ? videoFile.name
                  : hasExistingFile
                  ? `Current: ${lesson.video_file.split('/').pop()}`
                  : 'Click to upload video file'}
              </span>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setVideoFile(e.target.files[0] || null)}
              />
            </label>
            {videoFile && (
              <button
                type="button"
                onClick={() => setVideoFile(null)}
                className="text-xs text-red-400 hover:text-red-600 mt-1"
              >
                ✕ Remove selected file
              </button>
            )}
          </FieldRow>

          {/* Fallback: external URL (only shown when no file selected or uploaded) */}
          {!videoFile && !hasExistingFile && (
            <FieldRow label="Or paste a video URL">
              <input
                type="url"
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                className={inputCls(false)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </FieldRow>
          )}
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Duration (e.g. 12:30)">
              <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputCls(false)} />
            </FieldRow>
            <FieldRow label="Order">
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className={inputCls(false)} />
            </FieldRow>
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="sm" variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Lesson'}</Button>
          </div>
        </div>
      )}

      {/* Quiz section */}
      {quizOpen && (
        <div className="px-4 pb-4 bg-background border-t border-[#F0E8E5]">
          <QuizManager lessonId={lesson.id} />
        </div>
      )}
    </div>
  );
}

// ─── Module Row ────────────────────────────────────────────────────────────────

function ModuleRow({ module, courseId, index, onUpdated, onDeleted }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [lessons, setLessons] = useState(module.lessons || []);
  const [editForm, setEditForm] = useState({ title: module.title, order: module.order });
  const [saving, setSaving] = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', video_url: '', duration: '', order: '' });
  const [savingLesson, setSavingLesson] = useState(false);

  const handleSaveModule = async () => {
    setSaving(true);
    try {
      const { data } = await courseApi.updateModule(module.id, { ...editForm, course: courseId });
      onUpdated(data);
      setEditing(false);
    } catch { } finally { setSaving(false); }
  };

  const handleDeleteModule = async () => {
    if (!window.confirm(`Delete module "${module.title}" and all its lessons?`)) return;
    await courseApi.deleteModule(module.id);
    onDeleted(module.id);
  };

  const handleAddLesson = async () => {
    if (!lessonForm.title.trim()) return;
    setSavingLesson(true);
    try {
      const { data } = await courseApi.createLesson({
        ...lessonForm,
        module: module.id,
        order: lessons.length + 1,
      });
      setLessons((prev) => [...prev, data]);
      setLessonForm({ title: '', description: '', video_url: '', duration: '', order: '' });
      setAddingLesson(false);
    } catch { } finally { setSavingLesson(false); }
  };

  const handleLessonUpdated = (updated) => {
    setLessons((prev) => prev.map((l) => l.id === updated.id ? { ...l, ...updated } : l));
  };

  const handleLessonDeleted = (id) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="rounded-2xl border border-[#F0E8E5] overflow-hidden">
      {/* Module header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-white hover:bg-background transition-colors">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-secondary font-bold text-sm shrink-0">{module.order}</div>

        {editing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="flex-1 px-3 py-1.5 rounded-xl border border-[#E5DDD9] text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              autoFocus
            />
            <Button size="sm" variant="primary" onClick={handleSaveModule} disabled={saving}>{saving ? '...' : 'Save'}</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-textDark">{module.title}</p>
              <p className="text-xs text-gray-400">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}>
                {expanded ? 'Hide' : 'Lessons'}
              </Button>
              <Button size="sm" variant="danger" onClick={handleDeleteModule}>Del</Button>
            </div>
          </>
        )}
      </div>

      {/* Lessons list */}
      {expanded && (
        <div className="border-t border-[#F0E8E5] px-4 py-4 bg-background space-y-2">
          {lessons.length === 0 && <p className="text-sm text-gray-400">No lessons yet.</p>}
          {lessons.map((lesson, idx) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              moduleId={module.id}
              index={idx}
              onUpdated={handleLessonUpdated}
              onDeleted={handleLessonDeleted}
            />
          ))}

          {/* Add lesson form */}
          {addingLesson ? (
            <div className="bg-white rounded-xl border border-secondary/30 p-4 space-y-3 mt-2">
              <p className="text-xs font-semibold text-textDark">New Lesson</p>
              <FieldRow label="Title *">
                <input type="text" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} className={inputCls(false)} placeholder="Lesson title" />
              </FieldRow>
              <FieldRow label="Description">
                <textarea value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} rows={2} className={inputCls(false) + ' resize-none'} />
              </FieldRow>
              <FieldRow label="Video URL">
                <input type="url" value={lessonForm.video_url} onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} className={inputCls(false)} placeholder="https://youtube.com/..." />
              </FieldRow>
              <FieldRow label="Duration (e.g. 12:30)">
                <input type="text" value={lessonForm.duration} onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })} className={inputCls(false)} />
              </FieldRow>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setAddingLesson(false)}>Cancel</Button>
                <Button size="sm" variant="primary" onClick={handleAddLesson} disabled={savingLesson}>{savingLesson ? 'Adding...' : 'Add Lesson'}</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setAddingLesson(true)} className="mt-1">+ Add Lesson</Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', is_published: false });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Per-course expanded state + full course data (with modules)
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [expandedCourseData, setExpandedCourseData] = useState(null);
  const [courseDetailLoading, setCourseDetailLoading] = useState(false);

  // Course inline editing
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editCourseForm, setEditCourseForm] = useState({ title: '', description: '' });
  const [savingCourse, setSavingCourse] = useState(false);

  // Per-course: adding module form
  const [addingModuleCourseId, setAddingModuleCourseId] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: '', order: '' });
  const [savingModule, setSavingModule] = useState(false);

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await courseApi.getCourses();
      setCourses(data.results ?? data);
    } catch {
      setError('Failed to load courses.');
    } finally { setLoading(false); }
  };

  const handleExpandCourse = async (courseId) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
      setExpandedCourseData(null);
      setAddingModuleCourseId(null);
      return;
    }
    setExpandedCourseId(courseId);
    setExpandedCourseData(null);
    setCourseDetailLoading(true);
    try {
      const { data } = await courseApi.getCourse(courseId);
      setExpandedCourseData(data);
    } catch { } finally { setCourseDetailLoading(false); }
  };

  const handleStartEditCourse = (course) => {
    setEditingCourseId(course.id);
    setEditCourseForm({ title: course.title, description: expandedCourseData?.description || course.description || '' });
  };

  const handleSaveCourse = async (courseId) => {
    if (!editCourseForm.title.trim()) return;
    setSavingCourse(true);
    try {
      await courseApi.updateCourse(courseId, editCourseForm);
      setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, title: editCourseForm.title } : c));
      if (expandedCourseData) {
        setExpandedCourseData((prev) => ({ ...prev, title: editCourseForm.title, description: editCourseForm.description }));
      }
      setEditingCourseId(null);
    } catch { } finally { setSavingCourse(false); }
  };

  const handlePublishToggle = async (course) => {
    try {
      await courseApi.updateCourse(course.id, { is_published: !course.is_published });
      setCourses((prev) => prev.map((c) => c.id === course.id ? { ...c, is_published: !c.is_published } : c));
    } catch { }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    await courseApi.deleteCourse(id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
    if (expandedCourseId === id) { setExpandedCourseId(null); setExpandedCourseData(null); }
  };

  const validateCourse = () => {
    const errs = {};
    if (!courseForm.title.trim()) errs.title = 'Title is required.';
    if (!courseForm.description.trim()) errs.description = 'Description is required.';
    return errs;
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    const errs = validateCourse();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      await courseApi.createCourse(courseForm);
      await loadCourses();
      setCourseForm({ title: '', description: '', is_published: false });
      setShowAddCourse(false);
      setFormErrors({});
    } catch (err) {
      setFormErrors({ api: err.response?.data?.detail || 'Failed to create course.' });
    } finally { setSaving(false); }
  };

  const handleAddModule = async () => {
    if (!moduleForm.title.trim()) return;
    setSavingModule(true);
    try {
      const { data } = await courseApi.createModule({
        course: expandedCourseId,
        title: moduleForm.title,
        order: (expandedCourseData?.modules?.length ?? 0) + 1,
      });
      setExpandedCourseData((prev) => ({ ...prev, modules: [...(prev.modules || []), { ...data, lessons: [] }] }));
      setModuleForm({ title: '', order: '' });
      setAddingModuleCourseId(null);
    } catch { } finally { setSavingModule(false); }
  };

  const handleModuleUpdated = (updated) => {
    setExpandedCourseData((prev) => ({ ...prev, modules: prev.modules.map((m) => m.id === updated.id ? { ...m, ...updated } : m) }));
  };

  const handleModuleDeleted = (id) => {
    setExpandedCourseData((prev) => ({ ...prev, modules: prev.modules.filter((m) => m.id !== id) }));
  };

  if (loading) return <AdminLayout><SectionLoader message="Loading courses..." /></AdminLayout>;
  if (error) return <AdminLayout><ErrorMessage message={error} onRetry={loadCourses} /></AdminLayout>;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-textDark">Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Manage courses, modules, lessons, and quizzes.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddCourse(!showAddCourse)}>
          {showAddCourse ? 'Cancel' : '+ Add Course'}
        </Button>
      </div>

      {/* Add Course form */}
      {showAddCourse && (
        <Card className="mb-6">
          <h2 className="font-semibold text-textDark mb-4">New Course</h2>
          {formErrors.api && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{formErrors.api}</div>
          )}
          <form onSubmit={handleAddCourse} className="space-y-4">
            <Input label="Course Title" name="title" value={courseForm.title} onChange={(e) => { setCourseForm({ ...courseForm, title: e.target.value }); setFormErrors({ ...formErrors, title: '' }); }} error={formErrors.title} required />
            <FieldRow label="Description *">
              <textarea
                value={courseForm.description}
                onChange={(e) => { setCourseForm({ ...courseForm, description: e.target.value }); setFormErrors({ ...formErrors, description: '' }); }}
                rows={3}
                className={inputCls(formErrors.description) + ' resize-none'}
              />
              {formErrors.description && <p className="text-xs text-red-500">{formErrors.description}</p>}
            </FieldRow>
            <label className="flex items-center gap-2 text-sm text-textDark cursor-pointer">
              <input type="checkbox" checked={courseForm.is_published} onChange={(e) => setCourseForm({ ...courseForm, is_published: e.target.checked })} className="accent-secondary" />
              Publish immediately
            </label>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="ghost" onClick={() => setShowAddCourse(false)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Creating...' : 'Create Course'}</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Courses list */}
      <div className="space-y-4">
        {courses.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-400">No courses yet. Create your first course above.</p>
          </Card>
        ) : courses.map((course) => (
          <div key={course.id} className="bg-white rounded-2xl border border-[#F0E8E5] overflow-hidden">
            {/* Course header row */}
            <div className="flex items-center gap-4 px-6 py-4">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-secondary text-lg shrink-0">📚</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-textDark truncate">{course.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {course.module_count ?? 0} modules · {course.total_lessons ?? 0} lessons
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <Badge variant={course.is_published ? 'success' : 'gray'}>
                  {course.is_published ? 'Published' : 'Draft'}
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => handlePublishToggle(course)}>
                  {course.is_published ? 'Unpublish' : 'Publish'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleExpandCourse(course.id)}>
                  {expandedCourseId === course.id ? '▲ Collapse' : '▼ Expand'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleStartEditCourse(course)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDeleteCourse(course.id)}>Delete</Button>
              </div>
            </div>

            {/* Inline course edit form — shown immediately on Edit click */}
            {editingCourseId === course.id && (
              <div className="border-t border-[#F0E8E5] px-6 py-5 bg-background">
                <div className="bg-white rounded-2xl border border-secondary/30 p-4 space-y-3">
                  <p className="text-xs font-semibold text-textDark">Edit Course</p>
                  <FieldRow label="Title *">
                    <input
                      type="text"
                      value={editCourseForm.title}
                      onChange={(e) => setEditCourseForm({ ...editCourseForm, title: e.target.value })}
                      className={inputCls(false)}
                      autoFocus
                    />
                  </FieldRow>
                  <FieldRow label="Description">
                    <textarea
                      value={editCourseForm.description}
                      onChange={(e) => setEditCourseForm({ ...editCourseForm, description: e.target.value })}
                      rows={3}
                      className={inputCls(false) + ' resize-none'}
                    />
                  </FieldRow>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setEditingCourseId(null)}>Cancel</Button>
                    <Button size="sm" variant="primary" onClick={() => handleSaveCourse(course.id)} disabled={savingCourse}>
                      {savingCourse ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Expanded course content */}
            {expandedCourseId === course.id && (
              <div className="border-t border-[#F0E8E5] px-6 py-5 bg-background">
                {courseDetailLoading ? (
                  <p className="text-sm text-gray-400">Loading content...</p>
                ) : expandedCourseData ? (
                  <>
                    {/* Course description */}
                    <p className="text-sm text-gray-500 leading-relaxed mb-5">{expandedCourseData.description}</p>

                    {/* Modules */}
                    <div className="flex items-center justify-between mb-3">
                      <SectionTitle>Modules</SectionTitle>
                      <Button size="sm" variant="ghost" onClick={() => setAddingModuleCourseId(course.id)}>+ Add Module</Button>
                    </div>

                    <div className="space-y-3">
                      {(expandedCourseData.modules || []).length === 0 && (
                        <p className="text-sm text-gray-400">No modules yet.</p>
                      )}
                      {(expandedCourseData.modules || []).map((module, idx) => (
                        <ModuleRow
                          key={module.id}
                          module={module}
                          courseId={course.id}
                          index={idx}
                          onUpdated={handleModuleUpdated}
                          onDeleted={handleModuleDeleted}
                        />
                      ))}

                      {/* Add module form */}
                      {addingModuleCourseId === course.id && (
                        <div className="bg-white rounded-xl border border-secondary/30 p-4 space-y-3">
                          <p className="text-xs font-semibold text-textDark">New Module</p>
                          <FieldRow label="Title *">
                            <input type="text" value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} className={inputCls(false)} placeholder="Module title" autoFocus />
                          </FieldRow>
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => setAddingModuleCourseId(null)}>Cancel</Button>
                            <Button size="sm" variant="primary" onClick={handleAddModule} disabled={savingModule}>{savingModule ? 'Adding...' : 'Add Module'}</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
