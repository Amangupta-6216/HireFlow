import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Users,
  Eye,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  DollarSign,
  MapPin,
  Trash2,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export const JobManagementPage = () => {
  const { company } = useSelector((state) => state.auth);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const isApproved = company?.verifiedStatus === 'approved';

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      skills: '',
      jobType: 'full-time',
      experienceLevel: 'mid',
      location: company?.location || 'Remote',
      isRemote: true,
      salaryMin: '',
      salaryMax: '',
      status: isApproved ? 'open' : 'draft',
    },
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/jobs/company/all');
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (formData) => {
    try {
      setSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const payload = {
        ...formData,
        requirements: formData.requirements
          ? formData.requirements.split('\n').filter((r) => r.trim())
          : [],
        skills: formData.skills
          ? formData.skills.split(',').map((s) => s.trim())
          : [],
      };

      const res = await axiosClient.post('/jobs', payload);
      setSuccessMessage(res.data.message);
      setIsModalOpen(false);
      reset();
      loadJobs();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to create job posting');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to close this position? It will disappear from public search.')) {
      return;
    }
    try {
      await axiosClient.patch(`/jobs/${jobId}/close`);
      loadJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job posting and its associated applications?')) {
      return;
    }
    try {
      await axiosClient.delete(`/jobs/${jobId}`);
      loadJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Job Postings Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, publish, edit, and close positions for {company?.name}
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMessage(null);
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Job Post
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Table of Jobs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-14 bg-slate-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 p-6 space-y-2">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800">No jobs posted yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the button above to draft or publish your first position.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Position Title</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Type & Location</th>
                  <th className="py-4 px-6">Applicants</th>
                  <th className="py-4 px-6">Created Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 block text-sm"
                      >
                        {job.title}
                      </Link>
                      <span className="text-[11px] text-slate-400 capitalize">
                        {job.experienceLevel} level • ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          job.status === 'open'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : job.status === 'draft'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-600">
                      <span className="capitalize">{job.jobType}</span>
                      <p className="text-[11px] text-slate-400">{job.location} {job.isRemote && '(Remote)'}</p>
                    </td>

                    <td className="py-4 px-6">
                      <Link
                        to={`/recruiter/applicants?jobId=${job._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{job.applicantsCount || 0} applicants</span>
                      </Link>
                    </td>

                    <td className="py-4 px-6 text-slate-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      {job.status === 'open' && (
                        <button
                          onClick={() => handleCloseJob(job._id)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors"
                          title="Close position"
                        >
                          Close Job
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete job post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Create Position Posting</h3>
                <p className="text-xs text-slate-500">Draft or publish an open requisition</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit(handleCreateJob)} className="p-6 overflow-y-auto space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Job Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Architect (React / TypeScript)"
                  {...register('title', { required: 'Job title is required' })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                {errors.title && <p className="text-rose-600 text-xs mt-1">{errors.title.message}</p>}
              </div>

              {/* Job Type & Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Job Type
                  </label>
                  <select
                    {...register('jobType')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Experience Level
                  </label>
                  <select
                    {...register('experienceLevel')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead / Principal</option>
                  </select>
                </div>
              </div>

              {/* Location & Remote */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Location *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA"
                    {...register('location', { required: 'Location is required' })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                  {errors.location && <p className="text-rose-600 text-xs mt-1">{errors.location.message}</p>}
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      {...register('isRemote')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">Remote eligible</span>
                  </label>
                </div>
              </div>

              {/* Salary Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Minimum Salary (USD/yr)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 120000"
                    {...register('salaryMin')}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Maximum Salary (USD/yr)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 165000"
                    {...register('salaryMax')}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Job Description *
                </label>
                <textarea
                  rows={4}
                  placeholder="Outline key responsibilities, team mission, and impact..."
                  {...register('description', { required: 'Description is required' })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                ></textarea>
                {errors.description && <p className="text-rose-600 text-xs mt-1">{errors.description.message}</p>}
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Requirements (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g.&#10;5+ years building scalable React apps&#10;Deep familiarity with MongoDB compound indexing"
                  {...register('requirements')}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs resize-none"
                ></textarea>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Key Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Redux, Node.js, Express"
                  {...register('skills')}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {/* Publication Status */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Publishing Mode
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      value="draft"
                      {...register('status')}
                      className="text-blue-600"
                    />
                    <span>Save as Draft (Private)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 text-xs font-semibold cursor-pointer ${
                      isApproved ? 'text-slate-700' : 'text-slate-400 opacity-60'
                    }`}
                  >
                    <input
                      type="radio"
                      value="open"
                      disabled={!isApproved}
                      {...register('status')}
                      className="text-blue-600"
                    />
                    <span>Publish as Open {isApproved ? '(Live)' : '(Requires Admin Approval)'}</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  {submitting ? 'Creating...' : 'Create Position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagementPage;
