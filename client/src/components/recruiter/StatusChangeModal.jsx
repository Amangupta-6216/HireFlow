import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { X, ArrowRight, AlertCircle, CheckCircle, Bell } from 'lucide-react';
import { updateApplicationStatus } from '../../features/applications/applicationSlice';
import StatusBadge from '../common/StatusBadge';

export const StatusChangeModal = ({ application, isOpen, onClose, onUpdated }) => {
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      status: '',
      note: '',
    },
  });

  if (!isOpen || !application) return null;

  // Allowed transitions
  const validOptions = {
    Applied: ['Shortlisted', 'Rejected'],
    Shortlisted: ['Interview', 'Rejected'],
    Interview: ['Offer', 'Rejected'],
    Offer: ['Rejected'],
    Rejected: [],
  };

  const allowedNextStatuses = validOptions[application.status] || [];

  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMessage(null);

    const result = await dispatch(
      updateApplicationStatus({
        id: application._id,
        status: data.status,
        note: data.note,
      })
    );

    setSubmitting(false);

    if (updateApplicationStatus.fulfilled.match(result)) {
      reset();
      onUpdated?.();
      onClose();
    } else {
      setErrorMessage(result.payload || 'Failed to update application status');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Update Pipeline Stage</h3>
            <p className="text-xs text-slate-500">
              Moving applicant <span className="font-semibold text-slate-800">{application.candidate?.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current vs Next State */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase">Current Stage</p>
              <div className="mt-1">
                <StatusBadge status={application.status} />
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300" />
            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Target Stage</p>
              <p className="text-xs font-semibold text-blue-600 mt-1">Select below</p>
            </div>
          </div>

          {/* Target Status Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Next Stage
            </label>
            {allowedNextStatuses.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                This application is in a terminal stage ({application.status}) and cannot be transitioned further.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {allowedNextStatuses.map((st) => (
                  <label
                    key={st}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      watch('status') === st
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        value={st}
                        {...register('status', { required: 'Please select a new status' })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-slate-800">{st}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {errors.status && <p className="text-rose-600 text-xs mt-1">{errors.status.message}</p>}
          </div>

          {/* Note & Email Notification alert */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Stage Transition Note
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Cleared preliminary technical screening; scheduling technical deep dive..."
              {...register('note')}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            ></textarea>
            <div className="flex items-center gap-1.5 text-[11px] text-blue-600 mt-1.5 font-medium">
              <Bell className="w-3.5 h-3.5" />
              <span>An automated email notification will be delivered to {application.candidate?.email}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || allowedNextStatuses.length === 0}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Move Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusChangeModal;
