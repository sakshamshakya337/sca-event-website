// import emailjs from '@emailjs/browser'

// // EmailJS Configuration
// // Get these from https://dashboard.emailjs.com/
// const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID'
// const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID'
// const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY'

// // Initialize EmailJS
// emailjs.init(EMAILJS_PUBLIC_KEY)

// /**
//  * Send contact form email
//  * @param {Object} formData - Form data to send
//  * @param {string} formData.name - Sender's name
//  * @param {string} formData.email - Sender's email
//  * @param {string} formData.subject - Email subject
//  * @param {string} formData.message - Email message
//  * @param {string} formData.category - Query category
//  * @param {string} formData.role - Sender's role
//  * @param {string} formData.universityId - Sender's university ID
//  */
// export const sendContactEmail = async (formData) => {
//   try {
//     const templateParams = {
//       to_email: 'sakshamshakya231@gmail.com', // Admin email
//       from_name: formData.name,
//       from_email: formData.email,
//       subject: formData.subject,
//       message: formData.message,
//       category: formData.category || 'General',
//       role: formData.role || 'Not specified',
//       university_id: formData.universityId || 'N/A',
//       reply_to: formData.email,
//     }

//     const response = await emailjs.send(
//       EMAILJS_SERVICE_ID,
//       EMAILJS_TEMPLATE_ID,
//       templateParams
//     )

//     return { success: true, response }
//   } catch (error) {
//     console.error('EmailJS Error:', error)
//     return { success: false, error }
//   }
// }

// /**
//  * Send email for verification approval
//  * @param {Object} data - Email data
//  */
// export const sendApprovalEmail = async (data) => {
//   try {
//     const templateParams = {
//       to_name: data.name,
//       to_email: data.email,
//       role: data.role,
//       message: `Congratulations! Your ${data.role} account has been approved. You can now login to the SCA Event Management System.`,
//     }

//     const response = await emailjs.send(
//       EMAILJS_SERVICE_ID,
//       'template_approval', // You need to create this template
//       templateParams
//     )

//     return { success: true, response }
//   } catch (error) {
//     console.error('EmailJS Error:', error)
//     return { success: false, error }
//   }
// }

// /**
//  * Send email for verification rejection
//  * @param {Object} data - Email data
//  */
// export const sendRejectionEmail = async (data) => {
//   try {
//     const templateParams = {
//       to_name: data.name,
//       to_email: data.email,
//       role: data.role,
//       reason: data.reason || 'Not specified',
//       message: `We regret to inform you that your ${data.role} account verification has been rejected. Reason: ${data.reason || 'Not specified'}. Please contact the administration for more information.`,
//     }

//     const response = await emailjs.send(
//       EMAILJS_SERVICE_ID,
//       'template_rejection', // You need to create this template
//       templateParams
//     )

//     return { success: true, response }
//   } catch (error) {
//     console.error('EmailJS Error:', error)
//     return { success: false, error }
//   }
// }

// export default emailjs

// /**
//  * Send password reset email to the user's personal email
//  * Uses a separate EmailJS template: template_password_reset
//  * 
//  * Template variables needed in EmailJS dashboard:
//  *   to_name, to_email, reset_link, expires_in, user_id
//  */
// export const sendPasswordResetEmail = async ({ toName, toEmail, resetLink, userId }) => {
//   try {
//     const templateParams = {
//       to_name: toName,
//       to_email: toEmail,
//       reset_link: resetLink,
//       expires_in: '15 minutes',
//       user_id: userId,
//       support_email: 'sca@lpu.edu.in',
//     }

//     const response = await emailjs.send(
//       EMAILJS_SERVICE_ID,
//       import.meta.env.VITE_EMAILJS_RESET_TEMPLATE_ID || 'template_password_reset',
//       templateParams
//     )

//     return { success: true, response }
//   } catch (error) {
//     console.error('EmailJS password reset error:', error)
//     return { success: false, error }
//   }
// }

import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_RESET_TEMPLATE_ID =
  import.meta.env.VITE_EMAILJS_RESET_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

emailjs.init({
  publicKey: EMAILJS_PUBLIC_KEY,
});

export const sendPasswordResetEmail = async ({
  toName,
  toEmail,
  resetLink,
  userId,
}) => {
  const templateParams = {
    to_name: toName,
    to_email: toEmail,
    reset_link: resetLink,
    user_id: userId,
    expires_in: "15 minutes",
    support_email: "sca@lpu.edu.in",
  };

  console.log("==================================");
  console.log("EMAILJS CONFIG");
  console.log({
    service: EMAILJS_SERVICE_ID,
    template: EMAILJS_RESET_TEMPLATE_ID,
    publicKey: EMAILJS_PUBLIC_KEY,
  });

  console.log("==================================");
  console.log("EMAILJS TEMPLATE PARAMS");
  console.table(templateParams);

  if (!templateParams.to_email) {
    console.error("❌ ERROR: to_email is empty!");
    return {
      success: false,
      error: "Recipient email is empty",
    };
  }

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_RESET_TEMPLATE_ID,
      templateParams
    );

    console.log("✅ EmailJS Success");
    console.log(response);

    return {
      success: true,
      response,
    };
  } catch (error) {
    console.error("❌ EmailJS Failed");
    console.error(error);

    if (error.status) {
      console.log("Status:", error.status);
    }

    if (error.text) {
      console.log("Text:", error.text);
    }

    return {
      success: false,
      error,
    };
  }
};