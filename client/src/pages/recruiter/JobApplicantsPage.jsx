import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Users,
  Briefcase,
  FileText,
  Star,
  UserPlus,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import StatusChangeModal from '../../components/recruiter/StatusChangeModal';
import AssignInterviewerModal from '../../components/recruiter/AssignInterviewerModal';
import InterviewerFeedbackModal from '../../components/recruiter/InterviewerFeedbackModal';
import UserAvatar from '../../components/common/UserAvatar';

export const JobApplicantsPage = () => {
  const [searchParams] = useSearchParams();
  const { user, company } = useSelector((state) => state.auth);

  const initialJobId = searchParams.get('jobId') || 'all';
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [statusModalApp, setStatusModalApp] = useState(null);
  const [assignModalApp, setAssignModalApp] = useState(null);
  const [feedbackModalApp, setFeedbackModalApp] = useState(null);

  const isOwnerOrHr = company?.role === 'owner' || company?.role === 'hr';
  const isInterviewer = company?.role === 'interviewer';

  useEffect(() => {
    loadJobs();
    loadApplicants();
  }, [selectedJobId, selectedStatus]);

  const loadJobs = async () => {
    try {
      const res = await axiosClient.get('/jobs/company/all');
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    }
  };

  const loadApplicants = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/applications/job/${selectedJobId}`, {
        params: { status: selectedStatus !== 'all' ? selectedStatus : undefined },
      });
      setApplicants(res.data.applications || []);
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResume = async (applicationId) => {
    try {
      const res = await axiosClient.get(`/applications/${applicationId}/resume-url`);
      if (res.data?.signedUrl) {
        window.open(res.data.signedUrl, '_blank');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate signed resume URL');
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    if (!searchKeyword) return true;
    const kw = searchKeyword.toLowerCase();
    return (
      app.candidate?.name?.toLowerCase().includes(kw) ||
      app.candidate?.email?.toLowerCase().includes(kw) ||
      app.job?.title?.toLowerCase().includes(kw)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Applicant Pipeline & Evaluations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isInterviewer
              ? 'Evaluating candidates assigned specifically to you'
              : 'Manage candidates across Applied, Shortlisted, Interview, and Offer stages'}
          </p>
        </div>

        {/* Job selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Position:</span>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Company Positions ({jobs.length})</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title} ({j.applicantsCount || 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Stage Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-semibold w-full sm:w-auto">
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

          {/* Search by name/email */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name or role..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Applicants List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredApplicants.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-2">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">No applicants found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isInterviewer
              ? 'No candidates have been assigned to you for interview evaluation yet.'
              : 'There are currently no candidates matching the selected position and stage filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplicants.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Candidate Info */}
              <div className="flex items-start gap-4">
                <UserAvatar
                  user={app.candidate}
                  size="w-14 h-14"
                  textSize="text-2xl"
                  shape="rounded-2xl"
                  className="ring-2 ring-slate-100"
                />

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">{app.candidate?.name}</h3>
                    <StatusBadge status={app.status} />
                  </div>

                  <p className="text-xs text-slate-500">
                    Applying for <span className="font-semibold text-slate-700">{app.job?.title}</span> • {app.candidate?.email}
                  </p>

                  {/* Headline snippet */}
                  {app.candidateProfile?.headline && (
                    <p className="text-xs text-slate-600 font-medium pt-0.5">
                      {app.candidateProfile.headline}
                    </p>
                  )}

                  {/* Skills tags */}
                  {app.candidateProfile?.skills && app.candidateProfile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {app.candidateProfile.skills.slice(0, 5).map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                        >
                          {sk}
                        </span>
                      ))}
                      {app.candidateProfile.skills.length > 5 && (
                        <span className="text-[10px] text-slate-400">
                          +{app.candidateProfile.skills.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Assigned interviewers chips */}
                  {app.interviewers && app.interviewers.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-600">Assigned Interviewers:</span>
                      {app.interviewers.map((inv) => (
                        <span
                          key={inv._id || inv}
                          className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-medium"
                        >
                          {inv.name || 'Interviewer'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                {/* Resume download via presigned URL */}
                <button
                  onClick={() => handleOpenResume(app._id)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Generate secure short-lived presigned resume link"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  View Resume
                </button>

                {/* Submit / View Feedback */}
                <button
                  onClick={() => setFeedbackModalApp(app)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  Evaluate
                </button>

                {/* Owner & HR exclusive actions */}
                {isOwnerOrHr && (
                  <>
                    <button
                      onClick={() => setAssignModalApp(app)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Assign interviewers to this candidate"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-purple-600" />
                      Assign
                    </button>

                    <button
                      onClick={() => setStatusModalApp(app)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                    >
                      <span>Move Stage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Change Modal */}
      {statusModalApp && (
        <StatusChangeModal
          application={statusModalApp}
          isOpen={Boolean(statusModalApp)}
          onClose={() => setStatusModalApp(null)}
          onUpdated={() => {
            loadApplicants();
          }}
        />
      )}

      {/* Assign Interviewers Modal */}
      {assignModalApp && (
        <AssignInterviewerModal
          application={assignModalApp}
          isOpen={Boolean(assignModalApp)}
          onClose={() => setAssignModalApp(null)}
          onAssigned={() => {
            loadApplicants();
          }}
        />
      )}

      {/* Interviewer Feedback Modal */}
      {feedbackModalApp && (
        <InterviewerFeedbackModal
          application={feedbackModalApp}
          isOpen={Boolean(feedbackModalApp)}
          onClose={() => setFeedbackModalApp(null)}
          onFeedbackSubmitted={() => {
            loadApplicants();
          }}
        />
      )}
    </div>
  );
};

export default JobApplicantsPage;
