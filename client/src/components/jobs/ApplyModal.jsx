import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { X, Send, FileText, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { applyToJob } from '../../features/jobs/jobSlice';

export const ApplyModal = ({ job, isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      coverLetter: '',
    },
  });

  if (!isOpen || !job) return null;

  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMessage(null);

    const result = await dispatch(
      applyToJob({
        jobId: job._id,
        coverLetter: data.coverLetter,
      })
    );

    setSubmitting(false);

    if (applyToJob.fulfilled.match(result)) {
      reset();
      onSuccess?.(job._id);
      onClose();
    } else {
      setErrorMessage(result.payload || 'Failed to submit application. Make sure your resume is uploaded.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-white text-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                Applying to {job.company?.name || 'Company'}
              </span>
              <h2 className="text-xl font-bold text-white leading-tight">{job.title}</h2>
            </div>
          </div>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Profile & Resume status preview */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{user?.name}</p>
                <p className="text-slate-500">Your default profile resume will be attached</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ready
            </span>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Note or Cover Letter (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="Highlight relevant skills, achievements, and why you are an ideal fit for this role..."
              {...register('coverLetter', {
                maxLength: { value: 1500, message: 'Cover note cannot exceed 1500 characters' },
              })}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
            ></textarea>
            {errors.coverLetter && (
              <p className="text-rose-600 text-xs mt-1">{errors.coverLetter.message}</p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Confirm & Apply
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;
