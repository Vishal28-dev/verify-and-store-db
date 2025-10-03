import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') { /* ... */ }
  try {
    const { email, password } = req.body;
    if (!email || !password) { /* ... */ }

    const { data: user, error } = await supabase
      .from('users')
      .select('firstName, password') // Get the first name
      .eq('email', email)
      .single();

    if (error || !user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // --- THE CHANGE IS HERE ---
    // Send back the first name on success
    return res.status(200).json({ message: 'Login successful!', firstName: user.firstName });

  } catch (e) { /* ... */ }
}