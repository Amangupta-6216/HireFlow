import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  Calendar,
  CheckCircle2,
  Share2,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { fetchJobById, toggleSaveJob } from '../features/jobs/jobSlice';
import ApplyModal from '../components/jobs/ApplyModal';

export const JobDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentJob, loading, savedJobIds, appliedJobIds } = useSelector((state) => state.jobs);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchJobById(id));
    }
  }, [id, dispatch]);

  const isSaved = currentJob && savedJobIds.includes(currentJob._id);
  const isApplied = currentJob && appliedJobIds.includes(currentJob._id);

  const handleBookmark = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(toggleSaveJob(currentJob._id));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatSalary = (min, max, currency = 'USD') => {
    if (!min && !max) return 'Competitive compensation package';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)} / year`;
    if (min) return `From ${formatter.format(min)} / year`;
    return `Up to ${formatter.format(max)} / year`;
  };

  if (loading || !currentJob) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-slate-100 rounded-3xl"></div>
          <div className="h-96 bg-slate-100 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all jobs</span>
      </Link>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
              {currentJob.company?.logo ? (
                <img
                  src={currentJob.company.logo}
                  alt={currentJob.company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-700">
                  {currentJob.company?.name}
                </span>
                {currentJob.company?.verifiedStatus === 'approved' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Company
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {currentJob.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {currentJob.location}
                </span>
                <span className="flex items-center gap-1 capitalize">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {currentJob.jobType}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Posted {new Date(currentJob.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex sm:flex-col items-center gap-2 sm:self-start">
            {isApplied ? (
              <span className="w-full py-2.5 px-5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Applied
              </span>
            ) : user?.role === 'candidate' ? (
              <button
                onClick={() => setApplyModalOpen(true)}
                className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 hover:shadow-lg transition-all"
              >
                1-Click Apply
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Sign In to Apply
              </button>
            )}

            <div className="flex items-center gap-2 w-full">
              {user?.role !== 'company' && (
                <button
                  onClick={handleBookmark}
                  className={`flex-1 p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    isSaved
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4 fill-blue-600" /> : <Bookmark className="w-4 h-4" />}
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              )}

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
            {copiedLink && (
              <span className="text-[10px] text-emerald-600 font-semibold">Link copied to clipboard!</span>
            )}
          </div>
        </div>

        {/* Quick Highlights Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Experience Level</span>
            <p className="font-bold text-slate-800 capitalize mt-0.5">{currentJob.experienceLevel}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Remote Work</span>
            <p className="font-bold text-slate-800 mt-0.5">
              {currentJob.isRemote ? 'Available / 100% Remote' : 'On-Site / Hybrid'}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Salary Range</span>
            <p className="font-bold text-emerald-700 mt-0.5">
              {formatSalary(currentJob.salaryMin, currentJob.salaryMax, currentJob.currency)}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Applicants</span>
            <p className="font-bold text-slate-800 mt-0.5">{currentJob.applicantsCount || 0} applied</p>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Job Description & Requirements */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">About the Position</h2>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-2">
                {currentJob.description}
              </div>
            </div>

            {currentJob.requirements && currentJob.requirements.length > 0 && (
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Requirements & Qualifications</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  {currentJob.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentJob.skills && currentJob.skills.length > 0 && (
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Key Skills & Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentJob.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Company Overview Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              About {currentJob.company?.name}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              {currentJob.company?.description || 'No company bio provided.'}
            </p>

            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Industry:</span>
                <span className="font-semibold text-slate-800">{currentJob.company?.industry || 'Tech'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Company Size:</span>
                <span className="font-semibold text-slate-800">{currentJob.company?.companySize || '50-200'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Headquarters:</span>
                <span className="font-semibold text-slate-800">{currentJob.company?.location || 'Remote'}</span>
              </div>
            </div>

            {currentJob.company?.website && (
              <a
                href={currentJob.company.website}
                target="_blank"
                rel="noreferrer"
                className="w-full mt-2 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Visit Company Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {applyModalOpen && (
        <ApplyModal
          job={currentJob}
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          onSuccess={() => {
            dispatch(fetchJobById(currentJob._id));
          }}
        />
      )}
    </div>
  );
};

export default JobDetails;
