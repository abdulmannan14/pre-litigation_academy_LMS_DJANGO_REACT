import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { SectionLoader } from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import {
  getAdminStudents,
  createAdminStudent,
  updateAdminStudent,
  deleteAdminStudent,
  getStudentEnrollments,
  adminEnrollStudent,
  adminUnenrollStudent,
} from '../../api/progressApi';
import { getCourses } from '../../api/courseApi';

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-[#E5DDD9] text-sm text-textDark bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent';

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputCls + ' pr-10'}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

const EMPTY_FORM = { full_name: '', username: '', email: '', password: '' };

function UserModal({ mode, initial, onSave, onClose, saving, error }) {
  const [form, setForm] = useState(
    mode === 'edit'
      ? { full_name: initial.full_name || '', username: initial.username || '', email: initial.email || '', password: '' }
      : { ...EMPTY_FORM }
  );

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-[#F0E8E5] flex items-center justify-between">
          <h2 className="font-semibold text-textDark">{mode === 'edit' ? 'Edit Student' : 'Add New Student'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
            <input type="text" value={form.full_name} onChange={set('full_name')} placeholder="John Doe" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Username *</label>
            <input type="text" value={form.username} onChange={set('username')} placeholder="johndoe" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="john@example.com" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {mode === 'edit' ? 'New Password (leave blank to keep current)' : 'Password *'}
            </label>
            <PasswordInput
              value={form.password}
              onChange={set('password')}
              placeholder={mode === 'edit' ? 'Leave blank to keep current' : 'Min. 8 characters'}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#F0E8E5] flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={() => onSave(form)} disabled={saving}>
            {saving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Student'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ student, onConfirm, onClose, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="px-6 py-5 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-textDark mb-1">Delete Student</h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete <span className="font-medium text-textDark">{student.full_name || student.username}</span>? This action cannot be undone.
          </p>
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <Button variant="ghost" size="sm" className="flex-1" onClick={onClose}>Cancel</Button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white disabled:opacity-60 transition-colors"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EnrollModal({ student, onClose }) {
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState(new Set()); // set of course_id
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // course_id being toggled

  useEffect(() => {
    Promise.all([getCourses(), getStudentEnrollments(student.id)])
      .then(([coursesRes, enrollRes]) => {
        setCourses(coursesRes.data.results ?? coursesRes.data);
        setEnrolled(new Set(enrollRes.data.map((e) => e.course_id)));
      })
      .finally(() => setLoading(false));
  }, [student.id]);

  const toggle = async (courseId) => {
    setSaving(courseId);
    const wasEnrolled = enrolled.has(courseId);
    try {
      if (wasEnrolled) {
        await adminUnenrollStudent(student.id, courseId);
        setEnrolled((prev) => { const s = new Set(prev); s.delete(courseId); return s; });
        toast.success('Student unenrolled.');
      } else {
        await adminEnrollStudent(student.id, courseId);
        setEnrolled((prev) => new Set([...prev, courseId]));
        toast.success('Student enrolled.');
      }
    } catch { toast.error(wasEnrolled ? 'Failed to unenroll.' : 'Failed to enroll.'); } finally {
      setSaving(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-[#F0E8E5] flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-textDark">Course Enrollment</h2>
            <p className="text-xs text-gray-400 mt-0.5">{student.full_name || student.username}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-8">Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No courses available.</p>
          ) : (
            <div className="space-y-2">
              {courses.map((course) => {
                const isEnrolled = enrolled.has(course.id);
                const isSaving = saving === course.id;
                return (
                  <div
                    key={course.id}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                      isEnrolled ? 'border-secondary/30 bg-accent' : 'border-[#F0E8E5] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${isEnrolled ? 'bg-secondary' : 'bg-gray-300'}`} />
                      <span className="text-sm font-medium text-textDark truncate">{course.title}</span>
                    </div>
                    <button
                      onClick={() => toggle(course.id)}
                      disabled={isSaving}
                      className={`shrink-0 ml-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                        isEnrolled
                          ? 'bg-red-50 text-red-500 hover:bg-red-100'
                          : 'bg-secondary text-white hover:bg-secondary/90'
                      }`}
                    >
                      {isSaving ? '...' : isEnrolled ? 'Unenroll' : 'Enroll'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#F0E8E5] flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Modal state
  const [modal, setModal] = useState(null); // null | { mode: 'add' } | { mode: 'edit', student }
  const [deleteTarget, setDeleteTarget] = useState(null); // student object
  const [enrollTarget, setEnrollTarget] = useState(null); // student object
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getAdminStudents();
      setStudents(data);
    } catch {
      setError('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setModal({ mode: 'add' }); setModalError(''); };
  const openEdit = (student) => { setModal({ mode: 'edit', student }); setModalError(''); };
  const closeModal = () => { setModal(null); setModalError(''); };

  const handleSave = async (form) => {
    setSaving(true);
    setModalError('');
    try {
      if (modal.mode === 'add') {
        const payload = { ...form };
        const { data } = await createAdminStudent(payload);
        setStudents((prev) => [data, ...prev]);
        toast.success('Student created successfully.');
      } else {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        const { data } = await updateAdminStudent(modal.student.id, payload);
        setStudents((prev) =>
          prev.map((s) =>
            s.id === modal.student.id
              ? { ...s, username: data.username, email: data.email, full_name: data.full_name }
              : s
          )
        );
        toast.success('Student updated.');
      }
      closeModal();
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong.';
      setModalError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAdminStudent(deleteTarget.id);
      setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Student deleted.');
    } catch {
      setDeleteTarget(null);
      toast.error('Failed to delete student.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <AdminLayout><SectionLoader message="Loading students..." /></AdminLayout>;
  if (error) return <AdminLayout><ErrorMessage message={error} onRetry={load} /></AdminLayout>;

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.username.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.full_name || '').toLowerCase().includes(q)
    );
  });

  const total = students.length;
  const active = students.filter((s) => s.avg_progress > 0 && s.avg_progress < 100).length;
  const completed = students.filter((s) => s.avg_progress === 100).length;
  const notStarted = students.filter((s) => s.avg_progress === 0).length;

  return (
    <AdminLayout>
      {/* Modals */}
      {enrollTarget && (
        <EnrollModal
          student={enrollTarget}
          onClose={() => {
            setEnrollTarget(null);
            load(); // refresh enrolled_courses count
          }}
        />
      )}
      {modal && (
        <UserModal
          mode={modal.mode}
          initial={modal.student || {}}
          onSave={handleSave}
          onClose={closeModal}
          saving={saving}
          error={modalError}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          student={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textDark">Students</h1>
          <p className="text-sm text-gray-500 mt-1">All enrolled students and their progress.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>
          + Add Student
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Students', value: total,      color: 'text-textDark' },
          { label: 'Active',         value: active,     color: 'text-blue-600' },
          { label: 'Completed',      value: completed,  color: 'text-green-600' },
          { label: 'Not Started',    value: notStarted, color: 'text-gray-400' },
        ].map((s) => (
          <Card key={s.label} className="!p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, username or email..."
          className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-[#E5DDD9] text-sm text-textDark bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        />
      </div>

      {/* Students table */}
      <Card className="!p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12">
            {search ? 'No students match your search.' : 'No students yet.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0E8E5] bg-background">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Courses</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Progress</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8E5]">
                {filtered.map((student) => {
                  const initials = student.username.slice(0, 2).toUpperCase();
                  const status = student.avg_progress === 100 ? 'Completed' : student.avg_progress > 0 ? 'Active' : 'Not Started';
                  const statusVariant = student.avg_progress === 100 ? 'success' : student.avg_progress > 0 ? 'default' : 'gray';
                  const joined = new Date(student.date_joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                  return (
                    <tr key={student.id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-secondary shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-textDark">{student.full_name || student.username}</p>
                            <p className="text-xs text-gray-400">@{student.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{student.email}</td>
                      <td className="px-6 py-4 text-gray-500">{student.enrolled_courses}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-accent rounded-full h-1.5">
                            <div className="bg-secondary h-1.5 rounded-full transition-all" style={{ width: `${student.avg_progress}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{student.avg_progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{joined}</td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant}>{status}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEnrollTarget(student)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-secondary hover:bg-secondary hover:text-white transition-colors"
                          >
                            Enroll
                          </button>
                          <button
                            onClick={() => openEdit(student)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E5DDD9] text-gray-600 hover:bg-background transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(student)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
