import { supabase } from '../../lib/supabaseClient';
import { Resend } from 'resend';

// Initialize Resend with the API key from our .env.local file
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    // Step 1: Check if a user with this email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Step 2: Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000); // OTP is valid for 10 minutes

    // Step 3: Save the new OTP to our database table
    // We use upsert to overwrite any existing OTP for the same email
    const { error: otpError } = await supabase
      .from('otp_verifications')
      .upsert({ email, otp, expires_at }, { onConflict: 'email' });

    if (otpError) {
      throw otpError; // This will be caught by the catch block
    }

    // Step 4: Send the OTP email to the user via Resend
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Resend's default "from" address for testing
      to: email,
      subject: 'Your Verification Code for AMU App',
      html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`,
    });

    return res.status(200).json({ message: 'OTP has been sent to your email.' });

  } catch (error) {
    console.error('Full Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send OTP.' });
  }
}