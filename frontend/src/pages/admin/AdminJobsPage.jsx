import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { SectionLoader } from '../../components/common/Spinner';
import { getAdminJobs, createJob, updateJob, deleteJob } from '../../api/jobApi';

const inputCls = 'w-full px-3 py-2 rounded-xl border border-[#E5DDD9] text-sm text-textDark bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent';

const EMPTY = { firm: '', title: '', location: '', description: '', is_published: true };

function JobModal({ mode, initial, onSave, onClose, saving, error }) {
  const [form, setForm] = useState(mode === 'edit' ? { ...initial } : { ...EMPTY });
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-[#F0E8E5] flex items-center justify-between">
          <h2 className="font-semibold text-textDark">{mode === 'edit' ? 'Edit Job Post' : 'Add New Job Post'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Firm / Attorney Name *</label>
            <input type="text" value={form.firm} onChange={set('firm')} placeholder="e.g. Smith & Associates Law" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Position Title *</label>
            <input type="text" value={form.title} onChange={set('title')} placeholder="e.g. Pre-Litigation Paralegal" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Location *</label>
            <input type="text" value={form.location} onChange={set('location')} placeholder="e.g. Houston, TX · On-site" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Description *</label>
            <textarea value={form.description} onChange={set('description')} rows={4} placeholder="Describe the role in 2–3 sentences..." className={inputCls + ' resize-none'} />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, is_published: !f.is_published }))}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.is_published ? 'bg-secondary' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_published ? 'left-5' : 'left-0.5'}`} />
            </button>
            <span className="text-sm text-gray-600">{form.is_published ? 'Published (visible on landing page)' : 'Draft (hidden from landing page)'}</span>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#F0E8E5] flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={() => onSave(form)} disabled={saving}>
            {saving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Post Job'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminJobs();
      setJobs(data.results ?? data);
    } catch {
      toast.error('Failed to load job posts.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form) => {
    if (!form.firm || !form.title || !form.location || !form.description) {
      setModalError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setModalError('');
    try {
      if (modal.mode === 'add') {
        const { data } = await createJob(form);
        setJobs((prev) => [data, ...prev]);
        toast.success('Job post created.');
      } else {
        const { data } = await updateJob(modal.job.id, form);
        setJobs((prev) => prev.map((j) => j.id === modal.job.id ? { ...j, ...data } : j));
        toast.success('Job post updated.');
      }
      setModal(null);
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Something went wrong. Please try again.';
      if (data && typeof data === 'object') {
        msg = data.detail || data.error || Object.values(data)[0] || msg;
        if (Array.isArray(msg)) msg = msg[0];
      } else if (err.response?.status === 404) {
        msg = 'API endpoint not found — please redeploy the backend.';
      } else if (err.response?.status === 500) {
        msg = 'Server error — check backend logs.';
      } else if (!err.response) {
        msg = 'Cannot reach server. Check your connection.';
      }
      setModalError(String(msg));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteJob(deleteTarget.id);
      setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Job post deleted.');
    } catch {
      toast.error('Failed to delete job post.');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (job) => {
    try {
      const { data } = await updateJob(job.id, { ...job, is_published: !job.is_published });
      setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, ...data } : j));
      toast.success(data.is_published ? 'Job published.' : 'Job unpublished.');
    } catch {
      toast.error('Failed to update job.');
    }
  };

  if (loading) return <AdminLayout><SectionLoader message="Loading job posts..." /></AdminLayout>;

  const published = jobs.filter((j) => j.is_published).length;

  return (
    <AdminLayout>
      {/* Modal */}
      {modal && (
        <JobModal
          mode={modal.mode}
          initial={modal.job || {}}
          onSave={handleSave}
          onClose={() => { setModal(null); setModalError(''); }}
          saving={saving}
          error={modalError}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="font-semibold text-textDark mb-1">Delete Job Post</h3>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to delete <span className="font-medium text-textDark">"{deleteTarget.title}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white disabled:opacity-60 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textDark">Job Posts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage career opportunities shown on the landing page.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => { setModal({ mode: 'add' }); setModalError(''); }}>
          + Add Job Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-textDark">{jobs.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Posts</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{published}</p>
          <p className="text-xs text-gray-500 mt-0.5">Published</p>
        </Card>
      </div>

      {/* Job list */}
      {jobs.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-4xl mb-3">💼</p>
          <p className="font-medium text-textDark">No job posts yet.</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Add your first job post from a trusted attorney.</p>
          <Button variant="primary" size="sm" onClick={() => setModal({ mode: 'add' })}>+ Add Job Post</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="!p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wide">{job.firm}</p>
                    <Badge variant={job.is_published ? 'success' : 'gray'}>
                      {job.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-textDark">{job.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </div>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-2">{job.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(job)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E5DDD9] text-gray-600 hover:bg-background transition-colors"
                  >
                    {job.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => { setModal({ mode: 'edit', job }); setModalError(''); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E5DDD9] text-gray-600 hover:bg-background transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(job)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
