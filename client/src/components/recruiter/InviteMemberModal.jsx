import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { X, Mail, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { inviteTeamMember } from '../../features/company/companySlice';

export const InviteMemberModal = ({ isOpen, onClose, onInvited }) => {
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      email: '',
      companyRole: 'interviewer',
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessInfo(null);

    const result = await dispatch(inviteTeamMember(data));
    setSubmitting(false);

    if (inviteTeamMember.fulfilled.match(result)) {
      setSuccessInfo(result.payload);
      reset();
      onInvited?.();
    } else {
      setErrorMessage(result.payload || 'Failed to send team invitation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Invite Team Member</h3>
              <p className="text-xs text-slate-500">Send an invitation link with role permissions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successInfo && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successInfo.message}</span>
              </div>
              {successInfo.inviteLink && (
                <div className="pt-1.5">
                  <p className="text-[11px] text-emerald-700 font-medium">Local test direct link:</p>
                  <a
                    href={successInfo.inviteLink}
                    className="text-[11px] text-blue-600 underline break-all font-mono"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {successInfo.inviteLink}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. colleague@company.com"
              {...register('email', {
                required: 'Email address is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Please enter a valid email' },
              })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Company Role
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs space-y-1 block">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="hr"
                    {...register('companyRole')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-slate-800">HR Manager</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-5">
                  Job CRUD, moves candidates across pipeline stages, assigns interviewers.
                </p>
              </label>

              <label className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs space-y-1 block">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="interviewer"
                    {...register('companyRole')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-slate-800">Interviewer</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-5">
                  Evaluates assigned candidates, submits rating and hiring recommendation.
                </p>
              </label>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
