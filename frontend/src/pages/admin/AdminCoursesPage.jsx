import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import { SectionLoader } from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import * as courseApi from '../../api/courseApi';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', is_published: false });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await courseApi.getCourses();
      setCourses(data.results ?? data);
    } catch {
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
    if (formErrors[e.target.name]) setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    return errs;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      await courseApi.createCourse(form);
      await loadCourses();
      setForm({ title: '', description: '', is_published: false });
      setShowForm(false);
    } catch (err) {
      setFormErrors({ api: err.response?.data?.detail || 'Failed to create course.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async (course) => {
    try {
      await courseApi.updateCourse(course.id, { is_published: !course.is_published });
      setCourses((prev) =>
        prev.map((c) => c.id === course.id ? { ...c, is_published: !c.is_published } : c)
      );
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    try {
      await courseApi.deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch {}
  };

  if (loading) return <AdminLayout><SectionLoader message="Loading courses..." /></AdminLayout>;
  if (error) return <AdminLayout><ErrorMessage message={error} onRetry={loadCourses} /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-textDark">Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all courses, modules, and lessons.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">
          {showForm ? 'Cancel' : '+ Add Course'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <h2 className="font-semibold text-textDark mb-4">New Course</h2>
          {formErrors.api && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {formErrors.api}
            </div>
          )}
          <form onSubmit={handleAdd} className="space-y-4">
            <Input label="Course Title" name="title" value={form.title} onChange={handleChange} error={formErrors.title} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-textDark">Description <span className="text-secondary">*</span></label>
              <textarea
                name="description" value={form.description} onChange={handleChange} rows={3}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-textDark bg-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${formErrors.description ? 'border-red-400' : 'border-[#E5DDD9]'}`}
              />
              {formErrors.description && <p className="text-xs text-red-500">{formErrors.description}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm text-textDark cursor-pointer">
              <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} className="accent-secondary" />
              Publish immediately
            </label>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Creating...' : 'Create Course'}</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {courses.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-400">No courses yet. Create your first course above.</p>
          </Card>
        ) : courses.map((course) => (
          <div key={course.id} className="bg-white rounded-2xl border border-[#F0E8E5] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-secondary text-lg shrink-0">📚</div>
                <div className="min-w-0">
                  <p className="font-medium text-textDark truncate">{course.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {course.module_count ?? 0} modules · {course.total_lessons ?? 0} lessons
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4 flex-wrap justify-end">
                <Badge variant={course.is_published ? 'success' : 'gray'}>
                  {course.is_published ? 'Published' : 'Draft'}
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => handlePublishToggle(course)}>
                  {course.is_published ? 'Unpublish' : 'Publish'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setExpanded(expanded === course.id ? null : course.id)}>
                  {expanded === course.id ? 'Hide' : 'Expand'}
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(course.id)}>Delete</Button>
              </div>
            </div>

            {expanded === course.id && (
              <div className="border-t border-[#F0E8E5] px-6 py-4 bg-background">
                <p className="text-sm text-gray-500 mb-3 leading-relaxed">{course.description}</p>
                <h3 className="text-sm font-semibold text-textDark mb-3">Modules</h3>
                {!course.modules || course.modules.length === 0 ? (
                  <p className="text-sm text-gray-400">No modules yet.</p>
                ) : (
                  <div className="space-y-3">
                    {course.modules.map((module) => (
                      <div key={module.id} className="bg-white rounded-xl border border-[#F0E8E5] p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-textDark">{module.title}</p>
                          <span className="text-xs text-gray-400">{module.lesson_count ?? module.lessons?.length ?? 0} lessons</span>
                        </div>
                        <div className="space-y-1.5">
                          {(module.lessons || []).map((lesson) => (
                            <div key={lesson.id} className="flex items-center justify-between py-1.5 px-3 bg-background rounded-lg">
                              <span className="text-xs text-textDark">{lesson.title}</span>
                              <span className="text-xs text-gray-400">{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
