import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { firstName, lastName, email, password, selectedLength } = req.body;

    if (!firstName || !lastName || !email || !password || !selectedLength) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check for duplicate firstName and password combination
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('firstName', firstName)
      .eq('password', password)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'This name and generated password combination already exists. Please try a different password length.' });
    }
    const { data, error } = await supabase
      .from('users')
      .insert([
        { firstName, lastName, email, password, password_length: selectedLength },
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error.message);
     
      if (error.code === '23505') { 
          return res.status(409).json({ error: 'An account with this email already exists.' });
      }
      return res.status(500).json({ error: 'Could not create account.' });
    }

    return res.status(201).json({ message: 'Account created successfully!', user: data });

  } catch (e) {
   
    console.error('Server error:', e.message);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}