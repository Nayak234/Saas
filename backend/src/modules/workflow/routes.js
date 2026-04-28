import express from 'express';

const router = express.Router();

router.post('/trigger', async (req, res) => {
  const { trigger, payload } = req.body;
  let actions = [];

  if (trigger === 'message_contains_wifi') {
    actions.push({ type: 'send_message', text: 'Here are our WiFi plans: Basic/Pro/Enterprise' });
  }
  if (trigger === 'payment_pending') {
    actions.push({ type: 'send_reminder', text: 'Friendly reminder: your payment is still pending.' });
  }
  if (trigger === 'new_lead') {
    actions.push({ type: 'assign_agent', strategy: 'round_robin' });
  }

  res.json({ trigger, payload, actions, executedAt: new Date().toISOString() });
});

export default router;
