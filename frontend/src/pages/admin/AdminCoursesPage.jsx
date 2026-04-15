import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import { SectionLoader } from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import * as courseApi from '../../api/courseApi';

function inputCls(error) {
  return `w-full px-3 py-2 rounded-xl border text-sm text-textDark bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${error ? 'border-red-400' : 'border-[#E5DDD9]'}`;
}

function FieldRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export default function AdminCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add course form
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', is_published: false });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Inline edit
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await courseApi.getCourses();
      setCourses(data.results ?? data);
    } catch {
      setError('Failed to load courses.');
    } finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Required';
    if (!form.description.trim()) errs.description = 'Required';
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      await courseApi.createCourse(form);
      await load();
      setForm({ title: '', description: '', is_published: false });
      setShowAdd(false);
      setFormErrors({});
    } catch (err) {
      setFormErrors({ api: err.response?.data?.detail || 'Failed to create.' });
    } finally { setSaving(false); }
  };

  const handlePublishToggle = async (course) => {
    try {
      await courseApi.updateCourse(course.id, { is_published: !course.is_published });
      setCourses((prev) => prev.map((c) => c.id === course.id ? { ...c, is_published: !c.is_published } : c));
    } catch { }
  };

  const handleStartEdit = (course) => {
    setEditingId(course.id);
    setEditForm({ title: course.title, description: course.description || '' });
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.title.trim()) return;
    setSavingEdit(true);
    try {
      await courseApi.updateCourse(id, editForm);
      setCourses((prev) => prev.map((c) => c.id === id ? { ...c, ...editForm } : c));
      setEditingId(null);
    } catch { } finally { setSavingEdit(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    await courseApi.deleteCourse(id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) return <AdminLayout><SectionLoader message="Loading courses..." /></AdminLayout>;
  if (error) return <AdminLayout><ErrorMessage message={error} onRetry={load} /></AdminLayout>;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-textDark">Courses</h1>
          <p className="text-sm text-gray-500 mt-0.5">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" onClick={() => { setShowAdd(!showAdd); setFormErrors({}); }}>
          {showAdd ? 'Cancel' : '+ New Course'}
        </Button>
      </div>

      {/* Add Course form */}
      {showAdd && (
        <Card className="mb-6">
          <h2 className="font-semibold text-textDark mb-4">New Course</h2>
          {formErrors.api && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{formErrors.api}</div>
          )}
          <form onSubmit={handleAdd} className="space-y-4">
            <Input label="Title *" name="title" value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); setFormErrors({ ...formErrors, title: '' }); }} error={formErrors.title} />
            <FieldRow label="Description *">
              <textarea
                value={form.description}
                onChange={(e) => { setForm({ ...form, description: e.target.value }); setFormErrors({ ...formErrors, description: '' }); }}
                rows={3}
                className={inputCls(formErrors.description) + ' resize-none'}
                placeholder="What will students learn?"
              />
              {formErrors.description && <p className="text-xs text-red-500">{formErrors.description}</p>}
            </FieldRow>
            <label className="flex items-center gap-2 text-sm text-textDark cursor-pointer select-none">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="accent-secondary" />
              Publish immediately
            </label>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Creating...' : 'Create Course'}</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Course list */}
      {courses.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-gray-400 mb-3">No courses yet.</p>
          <Button variant="primary" onClick={() => setShowAdd(true)}>Create your first course</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl border border-[#F0E8E5] overflow-hidden">
              {/* Course row */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-xl shrink-0">📚</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-textDark truncate">{course.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {course.module_count ?? 0} modules · {course.total_lessons ?? 0} lessons
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <Badge variant={course.is_published ? 'success' : 'gray'}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  <button
                    onClick={() => handlePublishToggle(course)}
                    className="text-xs text-gray-500 hover:text-secondary underline"
                  >
                    {course.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <Button size="sm" variant="ghost" onClick={() => handleStartEdit(course)}>Edit</Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate(`/admin/courses/${course.id}`)}
                  >
                    Manage →
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(course.id)}>Delete</Button>
                </div>
              </div>

              {/* Inline edit form */}
              {editingId === course.id && (
                <div className="border-t border-[#F0E8E5] px-5 py-4 bg-background">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <FieldRow label="Title *">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className={inputCls(false)}
                        autoFocus
                      />
                    </FieldRow>
                    <FieldRow label="Description">
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className={inputCls(false)}
                      />
                    </FieldRow>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    <Button size="sm" variant="primary" onClick={() => handleSaveEdit(course.id)} disabled={savingEdit}>
                      {savingEdit ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
