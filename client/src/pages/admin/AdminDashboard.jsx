import React, { useEffect, useState } from 'react';
import {
  Shield,
  Users,
  Building2,
  Briefcase,
  FileText,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('companies');
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, companiesRes, jobsRes] = await Promise.all([
        axiosClient.get('/admin/stats'),
        axiosClient.get('/admin/companies'),
        axiosClient.get('/admin/jobs'),
      ]);
      setStats(statsRes.data.stats);
      setCompanies(companiesRes.data.companies || []);
      setJobs(jobsRes.data.jobs || []);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompanyStatus = async (id, status) => {
    try {
      await axiosClient.patch(`/admin/companies/${id}/status`, { status });
      setActionMessage({ type: 'success', text: `Company status updated to ${status.toUpperCase()}` });
      loadAdminData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update company status' });
    }
  };

  const handleDeleteJob = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove the job "${title}"?`)) return;
    try {
      await axiosClient.delete(`/admin/jobs/${id}`);
      setActionMessage({ type: 'success', text: `Job "${title}" removed by admin.` });
      loadAdminData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete job' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold mb-1">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            Platform Governance
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Control Center</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review company verification requests, moderate active postings, and inspect metrics
          </p>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Aggregate Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.users.total}</p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>{stats.users.candidates} candidates</span>
              <span>•</span>
              <span>{stats.users.companyUsers} recruiters</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Companies</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.companies.total}</p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span className="text-amber-600 font-bold">{stats.companies.pending} pending</span>
              <span>•</span>
              <span className="text-emerald-600">{stats.companies.approved} approved</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jobs Posted</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.jobs.total}</p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="text-emerald-600 font-semibold">{stats.jobs.open} open</span>
              <span>•</span>
              <span>{stats.jobs.draft} draft</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applications</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.applications.total}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 flex-wrap">
              <span>{stats.applications.byStatus.Applied} Applied</span>
              <span>•</span>
              <span>{stats.applications.byStatus.Interview} Interview</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">{stats.applications.byStatus.Offer} Offer</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'companies'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Company Verification & Approvals ({companies.length})
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'jobs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Job Postings Moderation ({jobs.length})
        </button>
      </div>

      {/* 1. Companies Tab */}
      {activeTab === 'companies' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Registered Companies</h2>
            <p className="text-xs text-slate-500">Approve or block organizations before they can publish jobs</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Company</th>
                  <th className="py-3.5 px-6">Owner / Contact</th>
                  <th className="py-3.5 px-6">Website / HQ</th>
                  <th className="py-3.5 px-6">Verification Status</th>
                  <th className="py-3.5 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {companies.map((comp) => (
                  <tr key={comp._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
                        {comp.logo ? (
                          <img src={comp.logo} alt={comp.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          comp.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{comp.name}</p>
                        <p className="text-[11px] text-slate-400">{comp.industry || 'Tech'}</p>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800">{comp.createdBy?.name || 'Recruiter'}</p>
                      <p className="text-[11px] text-slate-400">{comp.createdBy?.email}</p>
                    </td>

                    <td className="py-4 px-6 text-slate-600">
                      <p className="truncate max-w-[150px]">{comp.website || 'No website'}</p>
                      <p className="text-[11px] text-slate-400">{comp.location}</p>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          comp.verifiedStatus === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : comp.verifiedStatus === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {comp.verifiedStatus}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      {comp.verifiedStatus !== 'approved' && (
                        <button
                          onClick={() => handleUpdateCompanyStatus(comp._id, 'approved')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                        >
                          Approve
                        </button>
                      )}

                      {comp.verifiedStatus !== 'blocked' && (
                        <button
                          onClick={() => handleUpdateCompanyStatus(comp._id, 'blocked')}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors"
                        >
                          Block
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Jobs Moderation Tab */}
      {activeTab === 'jobs' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Job Postings Moderation</h2>
            <p className="text-xs text-slate-500">Remove fraudulent, spam, or non-compliant job listings</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Job Title</th>
                  <th className="py-3.5 px-6">Company</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Created</th>
                  <th className="py-3.5 px-6 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-sm text-slate-900">{job.title}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{job.jobType} • {job.location}</p>
                    </td>

                    <td className="py-4 px-6 text-slate-700 font-semibold">
                      {job.company?.name || 'Company'}
                    </td>

                    <td className="py-4 px-6">
                      <span className="capitalize px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px]">
                        {job.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteJob(job._id, job.title)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove Job
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
