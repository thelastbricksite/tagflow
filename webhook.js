// ============================================================
// api/webhook.js — Lemon Squeezy Webhook Handler
// Runs on Vercel serverless — auto upgrades users to Pro
// ============================================================
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service key (not anon key)
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── STEP 1: Verify webhook signature (security) ──────────
  const secret = process.env.LEMON_WEBHOOK_SECRET;
  const signature = req.headers['x-signature'];
  const body = JSON.stringify(req.body);
  const hash = crypto.createHmac('sha256', secret).update(body).digest('hex');

  if (hash !== signature) {
    console.error('Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // ── STEP 2: Handle payment events ────────────────────────
  const event = req.body;
  const eventName = event.meta?.event_name;
  const customerEmail = event.data?.attributes?.user_email;
  const orderId = event.data?.id;
  const productId = event.data?.attributes?.product_id;

  console.log(`Webhook received: ${eventName} for ${customerEmail}`);

  if (!customerEmail) {
    return res.status(400).json({ error: 'No email found' });
  }

  // ── STEP 3: Upgrade user based on event ──────────────────
  if (
    eventName === 'order_created' ||          // one-time payment
    eventName === 'subscription_created' ||   // new subscription
    eventName === 'subscription_payment_success' // renewal
  ) {
    // Check if lifetime deal or monthly
    const isLifetime = event.data?.attributes?.first_order_item?.product_name
      ?.toLowerCase().includes('lifetime');

    const { error } = await supabase
      .from('users')
      .upsert({
        email: customerEmail,
        is_pro: true,
        plan: isLifetime ? 'lifetime' : 'monthly',
        order_id: orderId,
        upgraded_at: new Date().toISOString(),
        daily_limit: 999999 // unlimited
      }, { onConflict: 'email' });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'DB error' });
    }

    console.log(`✅ User ${customerEmail} upgraded to Pro (${isLifetime ? 'Lifetime' : 'Monthly'})`);
  }

  // ── STEP 4: Handle cancellations ─────────────────────────
  if (
    eventName === 'subscription_cancelled' ||
    eventName === 'subscription_expired'
  ) {
    const { error } = await supabase
      .from('users')
      .update({
        is_pro: false,
        plan: 'free',
        daily_limit: 5
      })
      .eq('email', customerEmail);

    if (error) console.error('Downgrade error:', error);
    console.log(`User ${customerEmail} downgraded to free`);
  }

  return res.status(200).json({ success: true });
}
