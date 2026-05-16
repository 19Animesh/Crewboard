import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // SSL on port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendOtpEmail(email, otp, name) {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'CrewBoard'}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `${otp} is your CrewBoard verification code`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f0f17; padding: 40px 32px; border-radius: 16px; border: 1px solid #1e1e2e;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #4f46e5; border-radius: 12px; font-size: 18px; font-weight: 800; color: white; letter-spacing: -1px;">CB</div>
          <p style="margin: 12px 0 0; color: #ffffff; font-size: 20px; font-weight: 700;">CrewBoard</p>
        </div>

        <h2 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 8px 0;">Verify your email address</h2>
        <p style="color: #9ca3af; font-size: 15px; margin: 0 0 32px 0;">Hi ${name || 'there'}, use the OTP below to verify your email. It expires in 10 minutes.</p>

        <div style="background: #1a1a2e; border: 2px dashed #4f46e5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
          <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Your verification code</p>
          <p style="color: #ffffff; font-size: 48px; font-weight: 800; letter-spacing: 12px; margin: 0; font-variant-numeric: tabular-nums;">${otp}</p>
        </div>

        <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0;">
          If you didn't create a CrewBoard account, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
