import { createTransporter } from '../config/mailer.js'

// ── Base HTML template ────────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#FAF3EE;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <tr>
            <td style="background:#1E3A5F;padding:24px 32px;border-radius:12px 12px 0 0;">
              <p style="margin:0;color:#fff;font-size:18px;font-weight:700;">
                SCA Event Management System
              </p>
              <p style="margin:4px 0 0;color:#93C5FD;font-size:12px;">
                School of Computer Applications · LPU
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#fff;padding:36px 32px;border:1px solid #DDD0C4;
                       border-top:none;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background:#F2E8DF;padding:14px 32px;border-radius:0 0 12px 12px;
                       border:1px solid #DDD0C4;border-top:none;">
              <p style="margin:0;color:#A08060;font-size:11px;text-align:center;">
                © 2026 SCA EMS · LPU · Automated email — do not reply
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

const FROM = () =>
  `"${process.env.MAIL_FROM_NAME || 'SCA EMS'}" <${process.env.GMAIL_USER}>`

// ── 1. Welcome email with temporary password (admin creates user) ─────────────
export const sendWelcomeEmail = async ({ to, firstName, role, identifier, tempPassword }) => {
  const transporter = createTransporter()
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)
  const identifierLabel = role === 'student' ? 'Registration Number' : 'Email'

  await transporter.sendMail({
    from: FROM(),
    to,
    subject: `🎉 Your SCA EMS ${roleLabel} Account is Ready`,
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;color:#1C1B1F;">Welcome, ${firstName}! 🎉</h2>
      <p style="color:#4A4039;font-size:14px;line-height:1.6;">
        Your <strong>${roleLabel}</strong> account has been created.
        Use these credentials to log in:
      </p>
      <div style="background:#FAF3EE;border-left:4px solid #E87722;border-radius:8px;
                  padding:16px 20px;margin:20px 0;">
        <p style="margin:0 0 8px;color:#4A4039;font-size:13px;">
          <strong>${identifierLabel}:</strong>
          <span style="font-family:monospace;font-size:14px;color:#1C1B1F;">
            ${identifier}
          </span>
        </p>
        <p style="margin:0 0 8px;color:#4A4039;font-size:13px;">
          <strong>Temporary Password:</strong>
          <span style="background:#1E3A5F;color:#fff;font-family:monospace;
                       font-size:14px;padding:2px 10px;border-radius:4px;">
            ${tempPassword}
          </span>
        </p>
        <p style="margin:0;color:#4A4039;font-size:13px;">
          <strong>Login:</strong>
          <a href="${process.env.FRONTEND_URL}/portal" style="color:#0051D5;">
            ${process.env.FRONTEND_URL}/portal
          </a>
        </p>
      </div>
      <div style="background:#FFFBEB;border:1px solid #F59E0B;border-radius:8px;padding:12px;">
        <p style="margin:0;color:#92400E;font-size:13px;">
          ⚠️ You will be asked to change this password on first login.
        </p>
      </div>
      <div style="text-align:center;margin-top:24px;">
        <a href="${process.env.FRONTEND_URL}/portal"
           style="background:#E87722;color:#fff;padding:12px 28px;border-radius:8px;
                  text-decoration:none;font-weight:700;font-size:14px;">
          Login Now →
        </a>
      </div>
    `),
  })
  console.log(`✅ Welcome email sent → ${to}`)
}

// ── 2. Password reset link ────────────────────────────────────────────────────
export const sendPasswordResetEmail = async ({ to, firstName, resetToken, role }) => {
  const transporter = createTransporter()
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&role=${role}`

  await transporter.sendMail({
    from: FROM(),
    to,
    subject: '🔐 Reset Your SCA EMS Password — Link valid 1 hour',
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;color:#1C1B1F;">Reset Your Password 🔐</h2>
      <p style="color:#4A4039;font-size:14px;line-height:1.6;">
        Hi <strong>${firstName}</strong>, click below to reset your password.
        This link expires in <strong>1 hour</strong>.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${resetLink}"
           style="background:#E87722;color:#fff;padding:14px 36px;border-radius:8px;
                  text-decoration:none;font-weight:700;font-size:15px;">
          Reset My Password →
        </a>
      </div>
      <p style="color:#A08060;font-size:12px;text-align:center;">
        Or copy this link:<br/>
        <span style="font-family:monospace;font-size:11px;word-break:break-all;">
          ${resetLink}
        </span>
      </p>
      <div style="background:#FEF2F2;border:1px solid #EF4444;border-radius:8px;
                  padding:12px;margin-top:16px;">
        <p style="margin:0;color:#991B1B;font-size:13px;">
          🛡️ If you did not request this, ignore this email.
          Your password will not change.
        </p>
      </div>
    `),
  })
  console.log(`✅ Password reset email sent → ${to}`)
}

// ── 3. Account approved ───────────────────────────────────────────────────────
export const sendApprovalEmail = async ({ to, firstName, role, identifier }) => {
  const transporter = createTransporter()
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)

  await transporter.sendMail({
    from: FROM(),
    to,
    subject: '✅ Your SCA EMS Account Has Been Approved',
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;color:#1C1B1F;">Account Approved! ✅</h2>
      <p style="color:#4A4039;font-size:14px;line-height:1.6;">
        Hi <strong>${firstName}</strong>, your <strong>${roleLabel}</strong>
        account is now active. Login with: <strong>${identifier}</strong>
      </p>
      <div style="text-align:center;margin-top:24px;">
        <a href="${process.env.FRONTEND_URL}/portal"
           style="background:#E87722;color:#fff;padding:12px 28px;border-radius:8px;
                  text-decoration:none;font-weight:700;font-size:14px;">
          Login to SCA EMS →
        </a>
      </div>
    `),
  })
  console.log(`✅ Approval email sent → ${to}`)
}

// ── 4. Account rejected ───────────────────────────────────────────────────────
export const sendRejectionEmail = async ({ to, firstName, reason, referenceNumber }) => {
  const transporter = createTransporter()

  await transporter.sendMail({
    from: FROM(),
    to,
    subject: '⚠️ SCA EMS Application Update — Action Required',
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;color:#1C1B1F;">Application Update ⚠️</h2>
      <p style="color:#4A4039;font-size:14px;line-height:1.6;">
        Hi <strong>${firstName}</strong>, we could not approve your application.
      </p>
      <div style="background:#FEF2F2;border-left:4px solid #EF4444;border-radius:8px;
                  padding:16px;margin:16px 0;">
        <p style="margin:0;color:#991B1B;font-size:14px;font-style:italic;">
          "${reason}"
        </p>
      </div>
      <p style="color:#4A4039;font-size:13px;">
        Reference: <code>${referenceNumber}</code>
      </p>
      <div style="text-align:center;margin-top:24px;">
        <a href="${process.env.FRONTEND_URL}/signup"
           style="background:#DC2626;color:#fff;padding:12px 28px;border-radius:8px;
                  text-decoration:none;font-weight:700;font-size:14px;">
          Re-Apply →
        </a>
      </div>
    `),
  })
  console.log(`✅ Rejection email sent → ${to}`)
}

// ── Approval stage notification (to next approver) ────────────────────────────
export const sendApprovalStageEmail = async ({
  to, recipientName, eventTitle, eventDate,
  submittedBy, stage, approvalLink, approvedByStage
}) => {
  const transporter = createTransporter()
  await transporter.sendMail({
    from: FROM(),
    to,
    subject: `📋 Event Approval Required — "${eventTitle}" awaits your review`,
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;color:#1C1B1F;">Action Required: Event Approval 📋</h2>
      <p style="color:#4A4039;font-size:14px;line-height:1.6;">
        Dear <strong>${recipientName}</strong>,
      </p>
      <p style="color:#4A4039;font-size:14px;line-height:1.6;">
        An event has been approved by <strong>${approvedByStage}</strong> and now
        requires your review as <strong>${stage}</strong>.
      </p>
      <div style="background:#FAF3EE;border-left:4px solid #E87722;
                  border-radius:8px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0 0 6px;color:#1C1B1F;font-size:15px;font-weight:700;">
          ${eventTitle}
        </p>
        <p style="margin:0 0 4px;color:#4A4039;font-size:13px;">
          Submitted by: <strong>${submittedBy}</strong>
        </p>
        <p style="margin:0;color:#4A4039;font-size:13px;">
          Event Date: <strong>${new Date(eventDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong>
        </p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${approvalLink}"
           style="background:#E87722;color:#fff;padding:14px 32px;border-radius:8px;
                  text-decoration:none;font-weight:700;font-size:14px;">
          Review Event →
        </a>
      </div>
      <p style="color:#A08060;font-size:12px;text-align:center;">
        Login to SCA EMS to approve or reject with remarks.
      </p>
    `),
  })
  console.log(`✅ Stage approval email sent to ${to} (${stage})`)
}

// ── Final approval notification (to faculty after HOS approves) ───────────────
export const sendFinalApprovalEmail = async ({
  to, recipientName, eventTitle, eventDate, publicUrl
}) => {
  const transporter = createTransporter()
  await transporter.sendMail({
    from: FROM(),
    to,
    subject: `🎉 "${eventTitle}" is now LIVE — Approved by Head of School`,
    html: baseTemplate(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:48px;">🎉</div>
        <h2 style="margin:8px 0;color:#059669;font-size:22px;">Event Fully Approved!</h2>
      </div>
      <p style="color:#4A4039;font-size:14px;line-height:1.6;">
        Dear <strong>${recipientName}</strong>,
      </p>
      <p style="color:#4A4039;font-size:14px;line-height:1.6;">
        Your event <strong>"${eventTitle}"</strong> has been approved by the
        <strong>Head of School</strong> and is now:
      </p>
      <ul style="color:#4A4039;font-size:14px;line-height:2;">
        <li>✅ <strong>Live</strong> on the public events page</li>
        <li>✅ <strong>Registration open</strong> for students</li>
        <li>✅ <strong>Visible</strong> to all SCA students</li>
      </ul>
      <div style="background:#ECFDF5;border:1px solid #10B981;border-radius:8px;
                  padding:14px;margin:20px 0;text-align:center;">
        <p style="margin:0;color:#065F46;font-size:13px;font-weight:600;">
          Event Date: ${new Date(eventDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}
        </p>
      </div>
      <div style="text-align:center;margin-top:24px;">
        <a href="${publicUrl}"
           style="background:#059669;color:#fff;padding:14px 32px;border-radius:8px;
                  text-decoration:none;font-weight:700;font-size:14px;">
          View Live Event →
        </a>
      </div>
    `),
  })
  console.log(`✅ Final approval email sent to ${to}`)
}

// ── Rejection notification (to faculty at any stage) ─────────────────────────
export const sendRejectionStageEmail = async ({
  to, recipientName, eventTitle, rejectedBy, remarks
}) => {
  const transporter = createTransporter()
  await transporter.sendMail({
    from: FROM(),
    to,
    subject: `❌ Event Rejected — "${eventTitle}"`,
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;color:#DC2626;">Event Not Approved ❌</h2>
      <p style="color:#4A4039;font-size:14px;line-height:1.6;">
        Dear <strong>${recipientName}</strong>,
      </p>
      <p style="color:#4A4039;font-size:14px;line-height:1.6;">
        Your event <strong>"${eventTitle}"</strong> was not approved by
        <strong>${rejectedBy}</strong>.
      </p>
      ${remarks ? `
      <div style="background:#FEF2F2;border-left:4px solid #EF4444;border-radius:8px;
                  padding:14px 18px;margin:16px 0;">
        <p style="margin:0 0 4px;color:#991B1B;font-size:12px;font-weight:700;
                  text-transform:uppercase;">Remarks:</p>
        <p style="margin:0;color:#991B1B;font-size:14px;font-style:italic;">"${remarks}"</p>
      </div>` : ''}
      <p style="color:#4A4039;font-size:14px;">
        You may update your event details and resubmit for approval.
      </p>
      <div style="text-align:center;margin-top:24px;">
        <a href="${process.env.FRONTEND_URL}/faculty/events"
           style="background:#E87722;color:#fff;padding:14px 32px;border-radius:8px;
                  text-decoration:none;font-weight:700;font-size:14px;">
          View My Events →
        </a>
      </div>
    `),
  })
  console.log(`✅ Rejection email sent to ${to}`)
}
