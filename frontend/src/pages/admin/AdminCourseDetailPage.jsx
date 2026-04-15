import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { SectionLoader } from '../../components/common/Spinner';
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
            <Button size="sm" variant="danger" onClick={async () => { await quizApi.deleteQuestion(question.id); onDeleted(question.id); }}>Del</Button>
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
        <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={2} className={inputCls(false) + ' resize-none'} />
      </FieldRow>
      <div className="grid grid-cols-2 gap-3">
        {['A', 'B', 'C', 'D'].map((key) => (
          <FieldRow key={key} label={`Option ${key}`}>
            <input type="text" value={form[`option_${key.toLowerCase()}`]} onChange={(e) => setForm({ ...form, [`option_${key.toLowerCase()}`]: e.target.value })} className={inputCls(false)} />
          </FieldRow>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Correct Answer">
          <select value={form.correct_answer} onChange={(e) => setForm({ ...form, correct_answer: e.target.value })} className={inputCls(false)}>
            {['A', 'B', 'C', 'D'].map((k) => <option key={k}>{k}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Order">
          <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className={inputCls(false)} />
        </FieldRow>
      </div>
      <FieldRow label="Explanation">
        <textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={2} className={inputCls(false) + ' resize-none'} />
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
    } catch { setQuiz(null); } finally { setLoading(false); }
  };

  const handleCreateQuiz = async () => {
    setCreating(true);
    try {
      const { data } = await quizApi.createQuiz({ lesson: lessonId, title: '' });
      setQuiz({ ...data, questions: [] });
    } catch { } finally { setCreating(false); }
  };

  const handleAddQuestion = async () => {
    setSavingQ(true);
    try {
      const { data } = await quizApi.createQuestion({ ...qForm, quiz: quiz.id, order: (quiz.questions?.length ?? 0) + 1 });
      setQuiz((prev) => ({ ...prev, questions: [...(prev.questions || []), data] }));
      setQForm({ text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '', order: 1 });
      setAddingQuestion(false);
    } catch { } finally { setSavingQ(false); }
  };

  if (loading) return <p className="text-xs text-gray-400 py-2">Loading quiz...</p>;

  return (
    <div className="border-t border-[#F0E8E5] mt-3 pt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Quiz</p>
        {quiz && <Button size="sm" variant="danger" onClick={async () => { if (window.confirm('Delete quiz?')) { await quizApi.deleteQuiz(quiz.id); setQuiz(null); } }}>Delete Quiz</Button>}
      </div>
      {!quiz ? (
        <Button size="sm" variant="outline" onClick={handleCreateQuiz} disabled={creating}>{creating ? 'Creating...' : '+ Create Quiz'}</Button>
      ) : (
        <div className="space-y-2">
          {(quiz.questions || []).length === 0 && <p className="text-xs text-gray-400">No questions yet.</p>}
          {(quiz.questions || []).map((q) => (
            <QuestionRow key={q.id} question={q} quizId={quiz.id}
              onUpdated={(u) => setQuiz((prev) => ({ ...prev, questions: prev.questions.map((x) => x.id === u.id ? { ...x, ...u } : x) }))}
              onDeleted={(id) => setQuiz((prev) => ({ ...prev, questions: prev.questions.filter((x) => x.id !== id) }))}
            />
          ))}
          {addingQuestion ? (
            <div className="bg-white rounded-xl border border-secondary/30 p-4 space-y-3">
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
              <div className="grid grid-cols-2 gap-3">
                <FieldRow label="Correct Answer">
                  <select value={qForm.correct_answer} onChange={(e) => setQForm({ ...qForm, correct_answer: e.target.value })} className={inputCls(false)}>
                    {['A', 'B', 'C', 'D'].map((k) => <option key={k}>{k}</option>)}
                  </select>
                </FieldRow>
              </div>
              <FieldRow label="Explanation">
                <textarea value={qForm.explanation} onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })} rows={2} className={inputCls(false) + ' resize-none'} />
              </FieldRow>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setAddingQuestion(false)}>Cancel</Button>
                <Button size="sm" variant="primary" onClick={handleAddQuestion} disabled={savingQ}>{savingQ ? 'Adding...' : 'Add Question'}</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setAddingQuestion(true)}>+ Add Question</Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Lesson Card (right panel) ─────────────────────────────────────────────────

function LessonCard({ lesson, moduleId, index, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [form, setForm] = useState({
    title: lesson.title,
    description: lesson.description || '',
    duration: lesson.duration || '',
    order: lesson.order,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [clearVideo, setClearVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const hasExistingFile = !!lesson.video_file && !clearVideo;

  const handleSave = async () => {
    setSaving(true);
    setUploadProgress(0);
    try {
      const payload = { ...form, module: moduleId };
      if (videoFile) payload.video_file = videoFile;
      if (clearVideo) payload.clear_video_file = true;
      const { data } = await courseApi.updateLesson(lesson.id, payload, (e) => {
        if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      });
      onUpdated(data);
      setEditing(false);
      setVideoFile(null);
      setClearVideo(false);
    } catch { } finally { setSaving(false); setUploadProgress(0); }
  };

  return (
    <div className="rounded-xl border border-[#F0E8E5] overflow-hidden bg-white">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-secondary shrink-0">{index + 1}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-textDark truncate">{lesson.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {lesson.duration && <span className="text-xs text-gray-400">⏱ {lesson.duration}</span>}
            {lesson.video_file && <span className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-md px-1.5 py-0.5">Video ✓</span>}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button size="sm" variant="ghost" onClick={() => { setEditing(!editing); setQuizOpen(false); }}>{editing ? 'Close' : 'Edit'}</Button>
          <Button size="sm" variant="ghost" onClick={() => { setQuizOpen(!quizOpen); setEditing(false); }}>{quizOpen ? 'Hide Quiz' : 'Quiz'}</Button>
          <Button size="sm" variant="danger" onClick={async () => { if (window.confirm(`Delete "${lesson.title}"?`)) { await courseApi.deleteLesson(lesson.id); onDeleted(lesson.id); } }}>Del</Button>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="border-t border-[#F0E8E5] px-4 py-4 bg-background space-y-3">
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
                {videoFile ? videoFile.name : hasExistingFile ? `Current: ${lesson.video_file.split('/').pop()}` : 'Click to upload video file'}
              </span>
              <input
                type="file"
                accept=".mp4,.webm,.ogg,video/mp4,video/webm,video/ogg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0] || null;
                  setVideoFile(file);
                  if (file) {
                    const url = URL.createObjectURL(file);
                    const vid = document.createElement('video');
                    vid.preload = 'metadata';
                    vid.onloadedmetadata = () => {
                      URL.revokeObjectURL(url);
                      const total = Math.round(vid.duration);
                      setForm((f) => ({ ...f, duration: `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}` }));
                    };
                    vid.src = url;
                  }
                }}
              />
            </label>
            <p className="text-xs text-gray-400 mt-1">MP4, WebM, or Ogg only.</p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {videoFile && (
                <button type="button" onClick={() => { setVideoFile(null); setForm((f) => ({ ...f, duration: '' })); }} className="text-xs text-red-400 hover:text-red-600">✕ Remove selected file</button>
              )}
              {!!lesson.video_file && !videoFile && !clearVideo && (
                <button type="button" onClick={() => { setClearVideo(true); setForm((f) => ({ ...f, duration: '' })); }} className="text-xs text-red-400 hover:text-red-600">✕ Clear existing video</button>
              )}
              {clearVideo && (
                <span className="text-xs text-orange-500 flex items-center gap-2">
                  Video will be removed on save.
                  <button type="button" onClick={() => setClearVideo(false)} className="underline hover:text-orange-700">Undo</button>
                </span>
              )}
            </div>
            {saving && videoFile && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Uploading...</span><span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-secondary h-1.5 rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </FieldRow>

          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Duration (auto-filled on upload)">
              <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputCls(false)} placeholder="e.g. 12:30" />
            </FieldRow>
            <FieldRow label="Order">
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className={inputCls(false)} />
            </FieldRow>
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
            <Button size="sm" variant="primary" onClick={handleSave} disabled={saving}>
              {saving && videoFile ? `Uploading ${uploadProgress}%` : saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {/* Quiz */}
      {quizOpen && (
        <div className="border-t border-[#F0E8E5] px-4 pb-4 bg-background">
          <QuizManager lessonId={lesson.id} />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminCourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedModuleId, setSelectedModuleId] = useState(null);

  // Module edit
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [moduleEditTitle, setModuleEditTitle] = useState('');
  const [savingModule, setSavingModule] = useState(false);

  // Add module
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [savingNewModule, setSavingNewModule] = useState(false);

  // Add lesson
  const [addingLesson, setAddingLesson] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', duration: '', order: '' });
  const [newLessonFile, setNewLessonFile] = useState(null);
  const [savingLesson, setSavingLesson] = useState(false);
  const [lessonUploadProgress, setLessonUploadProgress] = useState(0);

  // Course edit
  const [editingCourse, setEditingCourse] = useState(false);
  const [courseEditForm, setCourseEditForm] = useState({ title: '', description: '' });
  const [savingCourse, setSavingCourse] = useState(false);

  useEffect(() => { load(); }, [courseId]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await courseApi.getCourse(courseId);
      setCourse(data);
      if (data.modules?.length > 0 && !selectedModuleId) {
        setSelectedModuleId(data.modules[0].id);
      }
    } catch { } finally { setLoading(false); }
  };

  const selectedModule = course?.modules?.find((m) => m.id === selectedModuleId);
  const lessons = selectedModule?.lessons || [];

  // ── Module actions ────────────────────────────────────────────────────────────

  const handleSaveModule = async (module) => {
    if (!moduleEditTitle.trim()) return;
    setSavingModule(true);
    try {
      const { data } = await courseApi.updateModule(module.id, { title: moduleEditTitle, order: module.order, course: courseId });
      setCourse((prev) => ({
        ...prev,
        modules: prev.modules.map((m) => m.id === module.id ? { ...m, title: data.title } : m),
      }));
      setEditingModuleId(null);
    } catch { } finally { setSavingModule(false); }
  };

  const handleDeleteModule = async (module) => {
    if (!window.confirm(`Delete module "${module.title}" and all its lessons?`)) return;
    await courseApi.deleteModule(module.id);
    setCourse((prev) => ({ ...prev, modules: prev.modules.filter((m) => m.id !== module.id) }));
    if (selectedModuleId === module.id) setSelectedModuleId(course.modules.find((m) => m.id !== module.id)?.id ?? null);
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    setSavingNewModule(true);
    try {
      const { data } = await courseApi.createModule({ course: Number(courseId), title: newModuleTitle, order: (course.modules?.length ?? 0) + 1 });
      setCourse((prev) => ({ ...prev, modules: [...(prev.modules || []), { ...data, lessons: [] }] }));
      setNewModuleTitle('');
      setAddingModule(false);
      setSelectedModuleId(data.id);
    } catch { } finally { setSavingNewModule(false); }
  };

  // ── Lesson actions ────────────────────────────────────────────────────────────

  const detectDuration = (file) => {
    const url = URL.createObjectURL(file);
    const vid = document.createElement('video');
    vid.preload = 'metadata';
    vid.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const total = Math.round(vid.duration);
      setLessonForm((f) => ({ ...f, duration: `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}` }));
    };
    vid.src = url;
  };

  const handleAddLesson = async () => {
    if (!lessonForm.title.trim()) return;
    setSavingLesson(true);
    setLessonUploadProgress(0);
    try {
      const payload = { ...lessonForm, module: selectedModuleId, order: lessons.length + 1 };
      if (newLessonFile) payload.video_file = newLessonFile;
      const { data } = await courseApi.createLesson(payload, (e) => {
        if (e.total) setLessonUploadProgress(Math.round((e.loaded / e.total) * 100));
      });
      setCourse((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === selectedModuleId ? { ...m, lessons: [...(m.lessons || []), data] } : m
        ),
      }));
      setLessonForm({ title: '', description: '', duration: '', order: '' });
      setNewLessonFile(null);
      setAddingLesson(false);
    } catch { } finally { setSavingLesson(false); setLessonUploadProgress(0); }
  };

  const handleLessonUpdated = (updated) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === selectedModuleId
          ? { ...m, lessons: m.lessons.map((l) => l.id === updated.id ? { ...l, ...updated } : l) }
          : m
      ),
    }));
  };

  const handleLessonDeleted = (id) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === selectedModuleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== id) } : m
      ),
    }));
  };

  // ── Course actions ────────────────────────────────────────────────────────────

  const handleSaveCourse = async () => {
    if (!courseEditForm.title.trim()) return;
    setSavingCourse(true);
    try {
      await courseApi.updateCourse(courseId, courseEditForm);
      setCourse((prev) => ({ ...prev, ...courseEditForm }));
      setEditingCourse(false);
    } catch { } finally { setSavingCourse(false); }
  };

  const handlePublishToggle = async () => {
    try {
      await courseApi.updateCourse(courseId, { is_published: !course.is_published });
      setCourse((prev) => ({ ...prev, is_published: !prev.is_published }));
    } catch { }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  if (loading) return <AdminLayout><SectionLoader message="Loading course..." /></AdminLayout>;
  if (!course) return <AdminLayout><p className="text-gray-400">Course not found.</p></AdminLayout>;

  return (
    <AdminLayout>
      {/* Breadcrumb + course header */}
      <div className="mb-5">
        <button
          onClick={() => navigate('/admin/courses')}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-secondary transition-colors mb-3"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </button>

        {editingCourse ? (
          <div className="bg-white rounded-2xl border border-[#F0E8E5] p-5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FieldRow label="Title">
                <input type="text" value={courseEditForm.title} onChange={(e) => setCourseEditForm({ ...courseEditForm, title: e.target.value })} className={inputCls(false)} autoFocus />
              </FieldRow>
              <FieldRow label="Description">
                <input type="text" value={courseEditForm.description} onChange={(e) => setCourseEditForm({ ...courseEditForm, description: e.target.value })} className={inputCls(false)} />
              </FieldRow>
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setEditingCourse(false)}>Cancel</Button>
              <Button size="sm" variant="primary" onClick={handleSaveCourse} disabled={savingCourse}>{savingCourse ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-textDark">{course.title}</h1>
              {course.description && <p className="text-sm text-gray-500 mt-1 max-w-2xl">{course.description}</p>}
              <div className="flex items-center gap-3 mt-2">
                <Badge variant={course.is_published ? 'success' : 'gray'}>{course.is_published ? 'Published' : 'Draft'}</Badge>
                <span className="text-xs text-gray-400">{course.modules?.length ?? 0} modules · {course.total_lessons ?? 0} lessons</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handlePublishToggle} className="text-xs text-gray-500 hover:text-secondary underline">
                {course.is_published ? 'Unpublish' : 'Publish'}
              </button>
              <Button size="sm" variant="ghost" onClick={() => { setEditingCourse(true); setCourseEditForm({ title: course.title, description: course.description || '' }); }}>
                Edit Course
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 2-column layout */}
      <div className="flex gap-4" style={{ height: 'calc(100vh - 260px)', minHeight: '500px' }}>

        {/* ── Left: Module sidebar ────────────────────────────────────────────── */}
        <div className="w-64 shrink-0 bg-white rounded-2xl border border-[#F0E8E5] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F0E8E5] flex items-center justify-between">
            <p className="text-sm font-semibold text-textDark">Modules</p>
            <button
              onClick={() => setAddingModule(!addingModule)}
              className="text-xs text-secondary hover:text-secondary/80 font-medium"
            >
              {addingModule ? 'Cancel' : '+ Add'}
            </button>
          </div>

          {/* Add module form */}
          {addingModule && (
            <div className="px-3 py-3 border-b border-[#F0E8E5] bg-background">
              <input
                type="text"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
                placeholder="Module title"
                className={inputCls(false) + ' mb-2'}
                autoFocus
              />
              <Button size="sm" variant="primary" onClick={handleAddModule} disabled={savingNewModule} className="w-full">
                {savingNewModule ? 'Adding...' : 'Add Module'}
              </Button>
            </div>
          )}

          {/* Module list */}
          <div className="flex-1 overflow-y-auto py-2">
            {(course.modules || []).length === 0 && (
              <p className="text-xs text-gray-400 px-4 py-3">No modules yet.</p>
            )}
            {(course.modules || []).map((module) => (
              <div key={module.id}>
                {editingModuleId === module.id ? (
                  <div className="px-3 py-2 bg-background border-b border-[#F0E8E5]">
                    <input
                      type="text"
                      value={moduleEditTitle}
                      onChange={(e) => setModuleEditTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveModule(module); if (e.key === 'Escape') setEditingModuleId(null); }}
                      className={inputCls(false) + ' mb-2 text-xs'}
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditingModuleId(null)} className="flex-1 text-xs">Cancel</Button>
                      <Button size="sm" variant="primary" onClick={() => handleSaveModule(module)} disabled={savingModule} className="flex-1 text-xs">
                        {savingModule ? '...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedModuleId(module.id)}
                    className={`w-full text-left px-4 py-2.5 transition-colors group ${selectedModuleId === module.id ? 'bg-accent border-r-2 border-secondary' : 'hover:bg-background'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${selectedModuleId === module.id ? 'text-secondary' : 'text-textDark'}`}>
                          {module.title}
                        </p>
                        <p className="text-xs text-gray-400">{module.lessons?.length ?? 0} lessons</p>
                      </div>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingModuleId(module.id); setModuleEditTitle(module.title); }}
                          className="p-1 text-gray-400 hover:text-secondary rounded"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteModule(module); }}
                          className="p-1 text-gray-400 hover:text-red-500 rounded"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Lesson panel ─────────────────────────────────────────────── */}
        <div className="flex-1 bg-white rounded-2xl border border-[#F0E8E5] flex flex-col overflow-hidden">
          {!selectedModule ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
              <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h8" />
              </svg>
              <p className="text-sm">Select a module to view its lessons</p>
            </div>
          ) : (
            <>
              {/* Lesson panel header */}
              <div className="px-5 py-3 border-b border-[#F0E8E5] flex items-center justify-between shrink-0">
                <div>
                  <p className="font-semibold text-textDark text-sm">{selectedModule.title}</p>
                  <p className="text-xs text-gray-400">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={() => { setAddingLesson(!addingLesson); setLessonForm({ title: '', description: '', duration: '', order: '' }); setNewLessonFile(null); }}
                  className="text-sm text-secondary hover:text-secondary/80 font-medium"
                >
                  {addingLesson ? 'Cancel' : '+ Add Lesson'}
                </button>
              </div>

              {/* Lesson list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">

                {/* Add lesson form */}
                {addingLesson && (
                  <div className="bg-background rounded-xl border border-secondary/30 p-4 space-y-3">
                    <p className="text-xs font-semibold text-textDark">New Lesson</p>
                    <FieldRow label="Title *">
                      <input type="text" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} className={inputCls(false)} placeholder="Lesson title" autoFocus />
                    </FieldRow>
                    <FieldRow label="Description">
                      <textarea value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} rows={2} className={inputCls(false) + ' resize-none'} />
                    </FieldRow>
                    <FieldRow label="Video File">
                      <label className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-dashed ${newLessonFile ? 'border-secondary bg-accent/20' : 'border-[#E5DDD9] hover:border-secondary'} cursor-pointer transition-colors`}>
                        <svg className="w-5 h-5 text-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm text-gray-600 truncate flex-1">{newLessonFile ? newLessonFile.name : 'Click to upload video'}</span>
                        <input type="file" accept=".mp4,.webm,.ogg,video/mp4,video/webm,video/ogg" className="hidden"
                          onChange={(e) => { const f = e.target.files[0] || null; setNewLessonFile(f); if (f) detectDuration(f); }}
                        />
                      </label>
                      <p className="text-xs text-gray-400 mt-1">MP4, WebM, or Ogg only.</p>
                      {newLessonFile && (
                        <button type="button" onClick={() => { setNewLessonFile(null); setLessonForm((f) => ({ ...f, duration: '' })); }} className="text-xs text-red-400 hover:text-red-600 mt-1">
                          ✕ Remove
                        </button>
                      )}
                      {savingLesson && newLessonFile && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs text-gray-500"><span>Uploading...</span><span>{lessonUploadProgress}%</span></div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-secondary h-1.5 rounded-full transition-all duration-200" style={{ width: `${lessonUploadProgress}%` }} />
                          </div>
                        </div>
                      )}
                    </FieldRow>
                    <FieldRow label="Duration (auto-filled on upload)">
                      <input type="text" value={lessonForm.duration} onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })} className={inputCls(false)} placeholder="e.g. 12:30" />
                    </FieldRow>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => setAddingLesson(false)} disabled={savingLesson}>Cancel</Button>
                      <Button size="sm" variant="primary" onClick={handleAddLesson} disabled={savingLesson}>
                        {savingLesson && newLessonFile ? `Uploading ${lessonUploadProgress}%` : savingLesson ? 'Adding...' : 'Add Lesson'}
                      </Button>
                    </div>
                  </div>
                )}

                {lessons.length === 0 && !addingLesson && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                    <p className="text-sm">No lessons in this module yet.</p>
                    <button onClick={() => setAddingLesson(true)} className="text-sm text-secondary hover:underline">Add the first lesson</button>
                  </div>
                )}

                {lessons.map((lesson, idx) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    moduleId={selectedModuleId}
                    index={idx}
                    onUpdated={handleLessonUpdated}
                    onDeleted={handleLessonDeleted}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
