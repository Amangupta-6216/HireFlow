import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Mail, UserPlus, Shield, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import InviteMemberModal from '../../components/recruiter/InviteMemberModal';
import UserAvatar from '../../components/common/UserAvatar';

export const TeamManagementPage = () => {
  const { user, company } = useSelector((state) => state.auth);
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/company/members');
      setMembers(res.data.members || []);
      setPendingInvites(res.data.pendingInvites || []);
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await axiosClient.patch(`/company/members/${memberId}/role`, { companyRole: newRole });
      setMessage({ type: 'success', text: `Team member role updated to ${newRole.toUpperCase()}` });
      loadTeamData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update role' });
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from your company team?`)) {
      return;
    }
    try {
      await axiosClient.delete(`/company/members/${memberId}`);
      setMessage({ type: 'success', text: `${memberName} has been removed from the team` });
      loadTeamData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to remove member' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-1">
            <Shield className="w-3.5 h-3.5" />
            Owner Exclusive Control
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Company Team & Permissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage who can publish jobs, advance applicant pipelines, and evaluate candidates for {company?.name}
          </p>
        </div>

        <button
          onClick={() => setInviteModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Invite Team Member
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Shield className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Active Members Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm space-y-4 p-6">
        <h2 className="text-base font-bold text-slate-900">Active Team Members ({members.length})</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-14 bg-slate-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Company Role</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {members.map((mem) => {
                  const isPrimaryOwner = mem.companyRole === 'owner';
                  return (
                    <tr key={mem._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <UserAvatar user={mem.user} companyRole={mem.companyRole} size="w-9 h-9" textSize="text-base" />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{mem.user?.name}</p>
                          {mem.user?._id === user?.id && (
                            <span className="text-[10px] text-blue-600 font-semibold">(You)</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                        {mem.user?.email}
                      </td>

                      <td className="py-3.5 px-4">
                        {isPrimaryOwner ? (
                          <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold uppercase tracking-wider">
                            Owner (Full Control)
                          </span>
                        ) : (
                          <select
                            value={mem.companyRole}
                            onChange={(e) => handleRoleChange(mem._id, e.target.value)}
                            className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="hr">HR Manager (Jobs & Pipeline)</option>
                            <option value="interviewer">Interviewer (Evaluations only)</option>
                          </select>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(mem.joinedAt || mem.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isPrimaryOwner && (
                          <button
                            onClick={() => handleRemoveMember(mem._id, mem.user?.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove team member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Invites Table */}
      {pendingInvites.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm space-y-4 p-6">
          <h2 className="text-base font-bold text-slate-900">Pending Email Invitations ({pendingInvites.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invited Email</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Invited By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pendingInvites.map((inv) => (
                  <tr key={inv._id}>
                    <td className="py-3.5 px-4 font-mono text-slate-800">{inv.email}</td>
                    <td className="py-3.5 px-4 uppercase font-bold text-blue-600">{inv.companyRole}</td>
                    <td className="py-3.5 px-4 text-slate-500">{inv.invitedBy?.name || 'Owner'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                        Pending
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {inviteModalOpen && (
        <InviteMemberModal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          onInvited={() => {
            loadTeamData();
          }}
        />
      )}
    </div>
  );
};

export default TeamManagementPage;
