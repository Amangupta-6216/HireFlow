const generateEmailWrapper = (title, contentHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 32px 24px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .body { padding: 32px 28px; line-height: 1.6; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 14px; margin: 12px 0; }
    .badge-applied { background-color: #dbeafe; color: #1d4ed8; }
    .badge-shortlisted { background-color: #fef3c7; color: #b45309; }
    .badge-interview { background-color: #e0e7ff; color: #4338ca; }
    .badge-offer { background-color: #dcfce7; color: #15803d; }
    .badge-rejected { background-color: #fee2e2; color: #b91c1c; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
    .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>HireFlow Career Portal</h1>
    </div>
    <div class="body">
      ${contentHtml}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} HireFlow Inc. All rights reserved. • Automated notification
    </div>
  </div>
</body>
</html>
`;

module.exports = {
  welcomeEmail: (userName) => ({
    subject: 'Welcome to HireFlow! 🚀',
    html: generateEmailWrapper(
      'Welcome to HireFlow',
      `<h2>Welcome aboard, ${userName}!</h2>
      <p>Thank you for joining <strong>HireFlow</strong>, the industry-standard job platform connecting top talent with industry leaders.</p>
      <p>Get started by completing your profile, adding your skills & experience, and uploading your resume for 1-click applications.</p>
      <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="btn">Go to Dashboard</a></p>`
    ),
  }),

  applicationSubmittedCandidate: (candidateName, jobTitle, companyName) => ({
    subject: `Application Submitted: ${jobTitle} at ${companyName}`,
    html: generateEmailWrapper(
      'Application Submitted',
      `<h2>Application Received! 🎉</h2>
      <p>Hi ${candidateName},</p>
      <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully submitted and forwarded to the recruiting team.</p>
      <p>Current Status: <span class="badge badge-applied">Applied</span></p>
      <p>You can track the progress of your application at any time in your Candidate Dashboard.</p>
      <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/candidate/applications" class="btn">Track Application</a></p>`
    ),
  }),

  applicationReceivedRecruiter: (recruiterName, candidateName, jobTitle) => ({
    subject: `New Applicant for ${jobTitle}: ${candidateName}`,
    html: generateEmailWrapper(
      'New Applicant Alert',
      `<h2>New Candidate Applied! 👤</h2>
      <p>Hi ${recruiterName},</p>
      <p><strong>${candidateName}</strong> has just applied for your open position: <strong>${jobTitle}</strong>.</p>
      <p>Review their candidate profile, qualifications, and resume in your Recruiter Pipeline dashboard.</p>
      <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/recruiter/jobs" class="btn">View Applicants</a></p>`
    ),
  }),

  applicationStatusChanged: (candidateName, jobTitle, companyName, newStatus, note) => {
    const badgeClass = `badge badge-${newStatus.toLowerCase()}`;
    return {
      subject: `Update on your application for ${jobTitle} at ${companyName}`,
      html: generateEmailWrapper(
        'Application Status Update',
        `<h2>Application Status Update 🔔</h2>
        <p>Hi ${candidateName},</p>
        <p>The recruiting team at <strong>${companyName}</strong> has updated the status of your application for <strong>${jobTitle}</strong>:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span class="${badgeClass}" style="font-size: 16px; padding: 8px 18px;">${newStatus}</span>
        </div>
        ${note ? `<div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0; font-style: italic;">"${note}"</div>` : ''}
        <p>Log in to your HireFlow portal to view next steps and manage your schedule.</p>
        <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/candidate/applications" class="btn">View My Applications</a></p>`
      ),
    };
  },

  companyInvitation: (inviterName, companyName, companyRole, inviteLink) => ({
    subject: `You've been invited to join ${companyName} on HireFlow`,
    html: generateEmailWrapper(
      'Team Invitation',
      `<h2>Join ${companyName} on HireFlow</h2>
      <p><strong>${inviterName}</strong> has invited you to join the <strong>${companyName}</strong> team as an <strong>${companyRole.toUpperCase()}</strong>.</p>
      <p>Click the link below to accept the invitation and set up your team account:</p>
      <p><a href="${inviteLink}" class="btn">Accept Invitation</a></p>
      <p style="font-size: 13px; color: #64748b; margin-top: 16px;">This invitation link will expire in 7 days.</p>`
    ),
  }),

  passwordResetEmail: (userName, resetUrl) => ({
    subject: 'Reset Your HireFlow Password 🔒',
    html: generateEmailWrapper(
      'Password Reset Request',
      `<h2>Password Reset Request</h2>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your password for your <strong>HireFlow</strong> account.</p>
      <p>Click the button below to choose a new password:</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </p>
      <p style="font-size: 13px; color: #64748b;">This link is valid for <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email — your account remains secure.</p>`
    ),
  }),
};
