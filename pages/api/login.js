import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') { /* ... */ }
  try {
    const { email, password } = req.body;
    if (!email || !password) { /* ... */ }

    const { data: user, error } = await supabase
      .from('users')
      .select('firstName, password')  
      .eq('email', email)
      .single();

    if (error || !user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    return res.status(200).json({ message: 'Login successful!', firstName: user.firstName });

  } catch (e) { /* ... */ }
}