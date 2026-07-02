import emailjs from '@emailjs/browser'

const SERVICE_ID             = import.meta.env.VITE_EMAILJS_SERVICE_ID
const PUBLIC_KEY             = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const TEMPLATE_RESET         = import.meta.env.VITE_EMAILJS_RESET_TEMPLATE_ID
const TEMPLATE_VERIFICATION  = import.meta.env.VITE_EMAILJS_VERIFICATION_TEMPLATE_ID

emailjs.init({ publicKey: PUBLIC_KEY })

// ── Internal helper ───────────────────────────────────────────────────────────
async function send(templateId, params) {
  if (!params.to_email) {
    console.error('[EmailJS] to_email is empty — aborting')
    return { success: false, error: 'Recipient email is empty' }
  }
  try {
    const response = await emailjs.send(SERVICE_ID, templateId, params)
    return { success: true, response }
  } catch (error) {
    console.error('[EmailJS] send failed', error)
    return { success: false, error }
  }
}

// ── Password Reset ────────────────────────────────────────────────────────────
// Template variables: to_name, to_email, reset_link, user_id, expires_in, support_email
export const sendPasswordResetEmail = ({ toName, toEmail, resetLink, userId }) =>
  send(TEMPLATE_RESET, {
    to_name:       toName,
    to_email:      toEmail,
    reset_link:    resetLink,
    user_id:       userId,
    expires_in:    '15 minutes',
    support_email: 'sca@lpu.edu.in',
  })

// ── Verification Decision (Approve / Reject) ──────────────────────────────────
// Template variables: to_name, to_email, decision, decision_label,
//   decision_icon, role, admin_notes, login_url, support_email
export const sendVerificationDecisionEmail = ({ toName, toEmail, decision, role, adminNotes }) => {
  const isApproved = decision === 'approved'
  return send(TEMPLATE_VERIFICATION, {
    to_name:          toName,
    to_email:         toEmail,
    decision_label:   isApproved ? 'APPROVED' : 'REJECTED',
    decision_message: isApproved
      ? `Your account is now fully verified. You have complete access to all SCA EMS features including event management, task tracking, and your personal dashboard. Log in and start exploring.`
      : `Your application could not be approved at this time. Please review the admin notes below, correct any issues with your documents, and resubmit from your profile settings.`,
    role:             role,
    admin_notes:      adminNotes || 'No additional notes provided.',
    login_url:        `${window.location.origin}/portal`,
    support_email:    'sca@lpu.edu.in',
  })
}
