const { Resend } = require('resend');
const twilio = require('twilio');

const resend = new Resend(process.env.RESEND_API_KEY);

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const sendSmsOtp = async (phone, code) => {
  return twilioClient.messages.create({
    body: `Your UAE Careers verification code is: ${code}. Valid for 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
};

const sendEmailOtp = async (email, code) => {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'UAE Careers <noreply@uaecareers.ae>',
    to: email,
    subject: 'Your UAE Careers Verification Code',
    html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code is valid for 10 minutes.</p>`,
  });
};

module.exports = { generateOtp, sendSmsOtp, sendEmailOtp };
