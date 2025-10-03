import { supabase } from '../../lib/supabaseClient';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log("--- Received request at /api/setup-totp ---");
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    console.log(`Step 1: Searching for user with email: ${email}`);
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (findError || !user) {
      console.error("--- DATABASE FIND ERROR ---", findError);
      return res.status(404).json({ error: 'User with this email not found.' });
    }

    console.log(`Step 2: Found user with ID: ${user.id}. Generating secret.`);
    const secret = speakeasy.generateSecret({ name: `AMU App (${email})` });

    console.log(`Step 3: Attempting to save secret to 'totp_secret' column.`);
    const { error: updateError } = await supabase
      .from('users')
      .update({ totp_secret: secret.base32 }) // This includes the fix
      .eq('id', user.id);

    if (updateError) {
      console.error("--- DATABASE UPDATE ERROR ---", updateError);
      return res.status(500).json({ error: 'Could not save secret.' });
    }

    console.log("Step 4: Secret saved. Generating QR code.");
    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        console.error("--- QR CODE ERROR ---", err);
        return res.status(500).json({ error: 'Could not generate QR code.' });
      }
      
      console.log("Step 5: Success! Sending QR code to frontend.");
      return res.status(200).json({ qrCode: data_url });
    });

  } catch (e) {
    console.error('--- UNEXPECTED SERVER ERROR ---', e);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}