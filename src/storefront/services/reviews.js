import { supabase } from '../../lib/supabase';

// Approved reviews are visible to everyone; the RLS policy
// `reviews_public_select_approved` enforces this server-side, so the anon
// client only ever sees approved rows.
export async function fetchApprovedReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, dishes(name)')
    .eq('is_approved', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Submit a review for moderation. Inserts as NOT approved; the admin Reviews
// page is the only place that flips is_approved to true.
export async function submitReview({ customer_name, user_email, dish_id, dish_name, rating, comment }) {
  if (!customer_name || !rating || !comment) {
    throw new Error('Name, rating and review are required.');
  }
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5.');
  }
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      customer_name: String(customer_name).trim(),
      user_email: user_email ? String(user_email).trim() : null,
      dish_id: dish_id || null,
      dish_name: dish_name ? String(dish_name).trim() : null,
      rating: Number(rating),
      comment: String(comment).trim(),
      is_approved: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}