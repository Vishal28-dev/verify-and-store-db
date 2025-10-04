import { supabase } from '../../lib/supabaseClient';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    const { error: otpError } = await supabase
      .from('otp_verifications')
      .upsert({ email, otp, expires_at }, { onConflict: 'email' });

    if (otpError) {
      throw otpError;
    }

   
    await transporter.sendMail({
      from: process.env.EMAIL_SERVER_USER, 
      to: email, 
      subject: 'Your Verification Code for Password Generator App',
      html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`,
    });

    return res.status(200).json({ message: 'OTP has been sent to your email.' });

  } catch (error) {
    console.error('Full Error:', error);
    return res.status(500).json({ error: 'Failed to send OTP.' });
  }
}