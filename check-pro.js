// ============================================================
// api/check-pro.js — Check if user is Pro
// Called from frontend when user enters their email
// ============================================================
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ is_pro: false, limit: 5 });

  const { data, error } = await supabase
    .from('users')
    .select('is_pro, plan, daily_limit')
    .eq('email', email)
    .single();

  if (error || !data) {
    return res.status(200).json({ is_pro: false, limit: 5, plan: 'free' });
  }

  return res.status(200).json({
    is_pro: data.is_pro || false,
    plan: data.plan || 'free',
    limit: data.daily_limit || 5
  });
}
