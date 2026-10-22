import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  FileText,
  ExternalLink,
  ChevronRight,
  X,
  History,
  CheckCircle2,
} from 'lucide-react';
import { fetchMyApplications } from '../../features/applications/applicationSlice';
import StatusBadge from '../../components/common/StatusBadge';
import axiosClient from '../../api/axiosClient';

export const MyApplicationsPage = () => {
  const dispatch = useDispatch();
  const { myApplications, loading } = useSelector((state) => state.applications);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [timelineApp, setTimelineApp] = useState(null);

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, [dispatch]);

  const filteredApps =
    selectedStatus === 'all'
      ? myApplications
      : myApplications.filter((a) => a.status === selectedStatus);

  const handleOpenResume = async (applicationId) => {
    try {
      const res = await axiosClient.get(`/applications/${applicationId}/resume-url`);
      if (res.data?.signedUrl) {
        window.open(res.data.signedUrl, '_blank');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to open resume');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Job Applications</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track real-time hiring progress, status updates, and feedback
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
          {['all', 'Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl transition-all capitalize ${
                selectedStatus === st
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">No applications found in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our open positions to submit applications with your profile and resume.
          </p>
          <Link
            to="/jobs"
            className="inline-block mt-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
          >
            Find Open Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-slate-600 shrink-0 shadow-inner">
                  {app.job?.company?.logo ? (
                    <img
                      src={app.job.company.logo}
                      alt={app.job.company.name}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <Building2 className="w-7 h-7 text-slate-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">
                      {app.job?.company?.name || 'Company'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-400">{app.job?.location}</span>
                  </div>

                  <Link to={`/jobs/${app.job?._id}`}>
                    <h3 className="font-bold text-lg text-slate-900 hover:text-blue-600 transition-colors">
                      {app.job?.title}
                    </h3>
                  </Link>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Submitted {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                    <span className="capitalize">{app.job?.jobType}</span>
                    <span className="capitalize font-medium text-emerald-600">
                      ${app.job?.salaryMin?.toLocaleString()} - ${app.job?.salaryMax?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge & Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <StatusBadge status={app.status} />

                <button
                  onClick={() => setTimelineApp(app)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  Status History
                </button>

                <button
                  onClick={() => handleOpenResume(app._id)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                  title="View presigned resume link"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Resume
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status History Timeline Modal */}
      {timelineApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Application Progression History</h3>
                <p className="text-xs text-slate-500">{timelineApp.job?.title} at {timelineApp.job?.company?.name}</p>
              </div>
              <button
                onClick={() => setTimelineApp(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              <div className="relative pl-6 space-y-6 border-l-2 border-blue-500/30">
                {timelineApp.statusHistory?.map((item, idx) => (
                  <div key={idx} className="relative group">
                    {/* Circle marker */}
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white bg-blue-600 shadow-sm" />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={item.status} />
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.changedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium pt-1">
                        {item.note || `Stage updated to ${item.status}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setTimelineApp(null)}
                className="px-5 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage;
