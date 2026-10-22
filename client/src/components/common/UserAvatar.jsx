import React from 'react';

/**
 * Universal Role & Professional Emoji Avatar for HireFlow
 * Replaces external photo avatars with clean, curated emoji badges tailored to job roles.
 */
export const UserAvatar = ({
  user,
  company,
  companyRole,
  size = 'w-8 h-8',
  textSize = 'text-sm',
  shape = 'rounded-full',
  className = '',
}) => {
  const role = user?.role;
  const effectiveCompanyRole = companyRole || company?.role || (role === 'company' ? 'company' : null);

  let emoji = '💼'; // Default career & job seeker emoji
  let bgClasses = 'bg-blue-50 border-blue-200 text-blue-700';

  if (role === 'admin') {
    emoji = '🛡️';
    bgClasses = 'bg-purple-50 border-purple-200 text-purple-700';
  } else if (role === 'company' || effectiveCompanyRole) {
    if (effectiveCompanyRole === 'owner') {
      emoji = '🏢';
      bgClasses = 'bg-indigo-50 border-indigo-200 text-indigo-700';
    } else if (effectiveCompanyRole === 'hr') {
      emoji = '👥';
      bgClasses = 'bg-blue-50 border-blue-200 text-blue-700';
    } else if (effectiveCompanyRole === 'interviewer') {
      emoji = '✨';
      bgClasses = 'bg-emerald-50 border-emerald-200 text-emerald-700';
    } else {
      emoji = '💼';
      bgClasses = 'bg-slate-100 border-slate-200 text-slate-700';
    }
  } else if (role === 'candidate') {
    emoji = '💼';
    bgClasses = 'bg-sky-50 border-sky-200 text-sky-700';
  }

  return (
    <div
      className={`${size} ${shape} ${bgClasses} border flex items-center justify-center ${textSize} shrink-0 shadow-2xs select-none transition-transform ${className}`}
      title={`${user?.name || 'User'} (${effectiveCompanyRole || role || 'Member'})`}
    >
      <span className="leading-none">{emoji}</span>
    </div>
  );
};

export default UserAvatar;
