import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { X, UserPlus, Check, AlertCircle } from 'lucide-react';
import { assignInterviewers } from '../../features/applications/applicationSlice';
import axiosClient from '../../api/axiosClient';
import UserAvatar from '../common/UserAvatar';

export const AssignInterviewerModal = ({ application, isOpen, onClose, onAssigned }) => {
  const dispatch = useDispatch();
  const [members, setMembers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (isOpen && application) {
      loadTeamMembers();
      setSelectedIds(application.interviewers?.map((u) => u._id || u) || []);
    }
  }, [isOpen, application]);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/company/members');
      setMembers(res.data.members || []);
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !application) return null;

  const toggleMember = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      setErrorMessage(null);
      await dispatch(
        assignInterviewers({
          id: application._id,
          interviewerIds: selectedIds,
        })
      );
      onAssigned?.();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to assign interviewers');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Assign Interviewers</h3>
            <p className="text-xs text-slate-500">
              For candidate <span className="font-semibold text-slate-800">{application.candidate?.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <p className="text-xs text-slate-600">
            Selected interviewers will gain access to evaluate this applicant's profile and submit ratings.
          </p>

          {/* Members List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loading ? (
              <p className="text-xs text-slate-400 text-center py-4">Loading company team members...</p>
            ) : members.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No team members found.</p>
            ) : (
              members.map((mem) => {
                const isSelected = selectedIds.includes(mem.user?._id);
                return (
                  <div
                    key={mem._id}
                    onClick={() => toggleMember(mem.user?._id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-400'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar user={mem.user} companyRole={mem.companyRole} size="w-8 h-8" textSize="text-sm" />
                      <div>
                        <p className="font-semibold text-xs text-slate-900">{mem.user?.name}</p>
                        <p className="text-[11px] text-slate-500 capitalize">{mem.companyRole}</p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {submitting ? 'Saving...' : 'Save Assignments'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignInterviewerModal;
