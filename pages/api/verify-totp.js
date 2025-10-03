import { supabase } from '../../lib/supabaseClient';
import speakeasy from 'speakeasy';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and token are required.' });
    }

    // --- Find the user and their saved TOTP secret ---
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('totp_secret')
      .eq('email', email)
      .single();

    if (findError || !user || !user.totp_secret) {
      return res.status(401).json({ error: 'Invalid email or token.' });
    }

    // --- Verify the token submitted by the user ---
    const verified = speakeasy.totp.verify({
      secret: user.totp_secret,
      encoding: 'base32',
      token: token,
    });

    // If the token is not valid
    if (!verified) {
      return res.status(401).json({ error: 'Invalid email or token.' });
    }

    // If the token is valid, login is successful
    return res.status(200).json({ message: 'Login successful!' });

  } catch (e) {
    console.error('Server error:', e.message);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}