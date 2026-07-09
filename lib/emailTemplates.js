export const credentialsTemplate = ({ name, email, tempPassword, role }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      
      <!-- Header -->
      <div style="background-color: #1a73e8; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">Welcome to SCA Portal</h2>
      </div>

      <!-- Body -->
      <div style="padding: 30px;">
        <p>Dear <strong>${name}</strong>,</p>
        <p>You have been added as a <strong style="color: #1a73e8; text-transform: uppercase;">${role}</strong> 
           in the SCA Portal. Below are your login credentials:</p>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #1a73e8;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Email:</td>
              <td style="padding: 8px 0; font-weight: bold;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Temporary Password:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #d93025;">${tempPassword}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fff3cd; padding: 12px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <strong>⚠️ Important:</strong> Please login and change your password immediately 
          after your first login for security purposes.
        </div>

        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
           style="display: inline-block; background-color: #1a73e8; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 6px; font-weight: bold;">
          Login Now
        </a>
      </div>

      <!-- Footer -->
      <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #999;">
        <p>This is an automated message. Do not reply to this email.</p>
        <p>© ${new Date().getFullYear()} SCA Portal. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const resetPasswordTemplate = ({ name, resetLink }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">

      <!-- Header -->
      <div style="background-color: #d93025; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">Password Reset Request</h2>
      </div>

      <!-- Body -->
      <div style="padding: 30px;">
        <p>Dear <strong>${name}</strong>,</p>
        <p>We received a request to reset your password for your SCA Portal account.</p>
        <p>Click the button below to set a new password:</p>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetLink}" 
             style="display: inline-block; background-color: #d93025; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset Password
          </a>
        </div>

        <div style="background-color: #fce8e6; padding: 12px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #d93025;">
          <strong>⏱ This link will expire in 15 minutes.</strong><br>
          If you did not request a password reset, please ignore this email. Your account is safe.
        </div>

        <p style="color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetLink}" style="color: #1a73e8; word-break: break-all;">${resetLink}</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #999;">
        <p>This is an automated message. Do not reply to this email.</p>
        <p>© ${new Date().getFullYear()} SCA Portal. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const verificationApprovedTemplate = ({ name, role }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="background-color: #28a745; padding: 30px; text-align: center;">
        <h2 style="color: white; margin: 0; font-size: 24px;">Welcome to SCA Portal! 🎉</h2>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">Your account has been approved.</p>
      </div>
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #555; line-height: 1.5; margin-bottom: 25px;">
          Great news! Your request to verify your account as a <strong><span style="text-transform: capitalize;">${role}</span></strong> has been successfully reviewed and <strong>approved</strong> by our administrative team.
        </p>
        <p style="font-size: 16px; color: #555; line-height: 1.5; margin-bottom: 30px;">
          You now have full access to the SCA Portal features specific to your role.
        </p>
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
             style="display: inline-block; background-color: #28a745; color: white; padding: 14px 35px; 
                    text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">
            Login to your Account
          </a>
        </div>
      </div>
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 13px; color: #888; border-top: 1px solid #eee;">
        <p style="margin-bottom: 5px;">This is an automated message. Please do not reply.</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} SCA Portal. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const verificationRejectedTemplate = ({ name, role, reason }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="background-color: #d93025; padding: 30px; text-align: center;">
        <h2 style="color: white; margin: 0; font-size: 24px;">Verification Update</h2>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">Action required on your account.</p>
      </div>
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #555; line-height: 1.5; margin-bottom: 25px;">
          We have reviewed your request to verify your account as a <strong><span style="text-transform: capitalize;">${role}</span></strong>. 
          Unfortunately, we are unable to approve your request at this time.
        </p>
        
        ${reason ? `
        <div style="background-color: #fce8e6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #d93025;">
          <strong style="color: #d93025; display: block; margin-bottom: 8px; font-size: 15px;">Reason for Rejection:</strong>
          <span style="color: #333; font-size: 15px; line-height: 1.4;">${reason}</span>
        </div>
        ` : ''}
        
        <p style="font-size: 15px; color: #666; line-height: 1.5; margin-top: 25px;">
          If you believe this was a mistake or have updated information, please contact the administration or submit a new verification request with corrected details.
        </p>
      </div>
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 13px; color: #888; border-top: 1px solid #eee;">
        <p style="margin-bottom: 5px;">This is an automated message. Please do not reply.</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} SCA Portal. All rights reserved.</p>
      </div>
    </div>
  `;
};
