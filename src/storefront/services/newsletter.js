import { supabase } from '../../lib/supabase';

export async function subscribeNewsletter(email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    throw new Error('Enter a valid email address.');
  }
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: String(email).trim().toLowerCase() })
      .select()
      .single();
    if (error) throw error;
    return { data, alreadySubscribed: false };
  } catch (err) {
    // A unique violation means the email is already on the list — treat that
    // as a friendly success rather than an error.
    if (err?.code === '23505') {
      return { data: null, alreadySubscribed: true };
    }
    throw err;
  }
}