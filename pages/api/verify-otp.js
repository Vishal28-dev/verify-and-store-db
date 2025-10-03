import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required.' });
  }

  try {
    // Step 1: Find the OTP record in the database
    const { data, error } = await supabase
      .from('otp_verifications')
      .select('otp, expires_at')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'OTP not found or already used. Please request a new one.' });
    }

    // Step 2: Check if the OTP has expired
    if (new Date() > new Date(data.expires_at)) {
      return res.status(400).json({ error: 'This OTP has expired. Please request a new one.' });
    }

    // Step 3: Check if the OTP is correct
    if (data.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP.' });
    }

    // If OTP is correct and not expired, we can delete it so it can't be used again
    await supabase.from('otp_verifications').delete().eq('email', email);

    // Step 4: Send success response
    return res.status(200).json({ message: 'Email verified successfully.' });

  } catch (error) {
    console.error('Full Error:', error);
    return res.status(500).json({ error: 'Failed to verify OTP.' });
  }
}