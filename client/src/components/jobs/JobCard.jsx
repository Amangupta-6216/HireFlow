import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Building2,
  Sparkles,
} from 'lucide-react';
import { toggleSaveJob } from '../../features/jobs/jobSlice';

export const JobCard = ({ job, onApplyClick }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { savedJobIds, appliedJobIds } = useSelector((state) => state.jobs);

  const isSaved = savedJobIds.includes(job._id);
  const isApplied = appliedJobIds.includes(job._id);

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    dispatch(toggleSaveJob(job._id));
  };

  const formatSalary = (min, max, currency = 'USD') => {
    if (!min && !max) return 'Competitive';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
    if (min) return `From ${formatter.format(min)}`;
    return `Up to ${formatter.format(max)}`;
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400/80 p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Header: Company & Bookmark */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
              {job.company?.logo ? (
                <img
                  src={job.company.logo}
                  alt={job.company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-600 truncate max-w-[180px]">
                  {job.company?.name || 'Company'}
                </span>
                {job.company?.verifiedStatus === 'approved' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50" title="Verified Company" />
                )}
              </div>
              <Link to={`/jobs/${job._id}`}>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mt-0.5">
                  {job.title}
                </h3>
              </Link>
            </div>
          </div>

          {/* Bookmark Button */}
          {user?.role !== 'company' && (
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-xl border transition-colors ${
                isSaved
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-slate-50 border-slate-200/60 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save job'}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 fill-blue-600" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200/60">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200/60 capitalize">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            {job.jobType}
          </span>
          {job.isRemote && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Sparkles className="w-3 h-3" />
              Remote
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
            <DollarSign className="w-3.5 h-3.5" />
            {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
          </span>
        </div>

        {/* Snippet Description */}
        <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Skills Pills */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {job.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/50 text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400 text-[10px]">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          {job.applicantsCount || 0} applicant{job.applicantsCount === 1 ? '' : 's'}
        </span>

        <div className="flex items-center gap-2">
          <Link
            to={`/jobs/${job._id}`}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
          >
            Details
          </Link>

          {isApplied ? (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Applied
            </span>
          ) : user?.role === 'candidate' ? (
            <button
              onClick={() => onApplyClick(job)}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm hover:shadow transition-all"
            >
              1-Click Apply
            </button>
          ) : (
            <Link
              to={`/jobs/${job._id}`}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all"
            >
              View Role
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
