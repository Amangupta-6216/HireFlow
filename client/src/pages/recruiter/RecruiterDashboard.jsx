import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Briefcase,
  Users,
  Clock,
  Award,
  Plus,
  Building2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import UserAvatar from '../../components/common/UserAvatar';

export const RecruiterDashboard = () => {
  const { user, company } = useSelector((state) => state.auth);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.all([
        axiosClient.get('/jobs/company/all'),
        axiosClient.get('/applications/job/all'),
      ]);
      setJobs(jobsRes.data.jobs || []);
      setApplicants(appsRes.data.applications || []);
    } catch (err) {
      console.error('Failed to load recruiter data:', err);
    } finally {
      setLoading(false);
    }
  };

  const isApproved = company?.verifiedStatus === 'approved';
  const isPending = company?.verifiedStatus === 'pending';
  const isOwner = company?.role === 'owner';
  const isHr = company?.role === 'hr';
  const isInterviewer = company?.role === 'interviewer';

  const totalJobs = jobs.length;
  const openJobs = jobs.filter((j) => j.status === 'open').length;
  const totalApplicants = applicants.length;
  const inInterview = applicants.filter((a) => a.status === 'Interview').length;
  const offersMade = applicants.filter((a) => a.status === 'Offer').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Company Verification Banner */}
      {isPending && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <h3 className="font-bold text-sm">Company Approval Pending Review</h3>
            <p className="text-amber-800">
              An administrator will verify your company before you can publish open job postings. You can draft positions and invite team members in the meantime.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {company?.name || 'Company Portal'}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              Role: {company?.role || 'team'}
            </span>
            {isApproved && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Recruiting Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor applicant pipelines, assign interview evaluations, and publish new roles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(isOwner || isHr) && (
            <Link
              to="/recruiter/jobs"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Post Job
            </Link>
          )}

          <Link
            to="/recruiter/applicants"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-4 h-4 text-slate-500" />
            View Pipeline ({totalApplicants})
          </Link>

          {isOwner && (
            <Link
              to="/recruiter/team"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-4 h-4 text-purple-600" />
              Manage Team
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Jobs</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{openJobs}</p>
          <span className="text-[11px] text-slate-500 font-medium">{totalJobs} total jobs created</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isInterviewer ? 'Assigned Applicants' : 'Total Applicants'}
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{totalApplicants}</p>
          <span className="text-[11px] text-slate-500 font-medium">In recruiting pipeline</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">In Interview</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{inInterview}</p>
          <span className="text-[11px] text-slate-500 font-medium">Under active evaluation</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Offers Made</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-700">{offersMade}</p>
          <span className="text-[11px] text-slate-500 font-medium">Selected top talent</span>
        </div>
      </div>

      {/* Two Columns: Recent Applicants & Active Postings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applicants */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Candidate Pipeline</h2>
              <p className="text-xs text-slate-500">Live candidate flow & stage transitions</p>
            </div>
            <Link
              to="/recruiter/applicants"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : applicants.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No applicants have applied yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {applicants.slice(0, 5).map((app) => (
                <div key={app._id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={app.candidate} size="w-10 h-10" textSize="text-lg" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{app.candidate?.name}</h4>
                      <p className="text-xs text-slate-500">
                        {app.job?.title} • {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Company Jobs Overview */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Company Positions</h2>
              <p className="text-xs text-slate-500">Draft, open, and closed postings</p>
            </div>
            {(isOwner || isHr) && (
              <Link
                to="/recruiter/jobs"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Manage</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No jobs created yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {jobs.slice(0, 5).map((job) => (
                <div key={job._id} className="py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{job.title}</h4>
                    <p className="text-xs text-slate-500">
                      {job.location} • {job.jobType} • {job.applicantsCount || 0} applicants
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      job.status === 'open'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : job.status === 'draft'
                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
