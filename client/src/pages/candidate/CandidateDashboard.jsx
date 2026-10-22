import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';
import { fetchMyApplications } from '../../features/applications/applicationSlice';
import { fetchJobs } from '../../features/jobs/jobSlice';
import StatusBadge from '../../components/common/StatusBadge';

export const CandidateDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myApplications, loading: appsLoading } = useSelector((state) => state.applications);
  const { jobs } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchMyApplications());
    dispatch(fetchJobs({ limit: 4 }));
  }, [dispatch]);

  const totalApps = myApplications.length;
  const shortlistedCount = myApplications.filter((a) => a.status === 'Shortlisted').length;
  const interviewCount = myApplications.filter((a) => a.status === 'Interview').length;
  const offerCount = myApplications.filter((a) => a.status === 'Offer').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Candidate Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track your open job applications and discover recommendations tailored to your profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/candidate/profile"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            Edit Profile & Resume
          </Link>
          <Link
            to="/jobs"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <Briefcase className="w-4 h-4" />
            Explore Jobs
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applied</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{totalApps}</p>
          <span className="text-[11px] text-slate-500 font-medium">Total submissions</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Shortlisted</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{shortlistedCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Under hiring review</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">Interviews</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{interviewCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Active evaluations</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Offers</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-700">{offerCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Offers extended</span>
        </div>
      </div>

      {/* Recent Applications Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
            <p className="text-xs text-slate-500">Live status updates from company hiring pipelines</p>
          </div>
          <Link
            to="/candidate/applications"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {appsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : myApplications.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 text-sm">No applications submitted yet</p>
            <p className="text-xs text-slate-500 mt-0.5">Explore open roles and apply with 1-click.</p>
            <Link
              to="/jobs"
              className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
            >
              Find Open Positions
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myApplications.slice(0, 4).map((app) => (
              <div key={app._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                    {app.job?.company?.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{app.job?.title}</h4>
                    <p className="text-xs text-slate-500">
                      {app.job?.company?.name} • Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  <Link
                    to="/candidate/applications"
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    View Status History
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;
