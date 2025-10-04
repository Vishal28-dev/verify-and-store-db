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
   
    const { data, error } = await supabase
      .from('otp_verifications')
      .select('otp, expires_at')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'OTP not found or already used. Please request a new one.' });
    }

    
    if (new Date() > new Date(data.expires_at)) {
      return res.status(400).json({ error: 'This OTP has expired. Please request a new one.' });
    }

    if (data.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP.' });
    }

 
    await supabase.from('otp_verifications').delete().eq('email', email);

   
    return res.status(200).json({ message: 'Email verified successfully.' });

  } catch (error) {
    console.error('Full Error:', error);
    return res.status(500).json({ error: 'Failed to verify OTP.' });
  }
}