import express from 'express';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

router.post('/webhook', async (req, res) => {
  const incoming = req.body;
  req.io.emit('whatsapp:incoming', incoming);
  res.json({ received: true });
});

router.use(requireAuth);

router.get('/connect', (req, res) => {
  res.json({
    provider: 'baileys',
    status: 'pending_qr_scan',
    qrCode: 'data:image/png;base64,PLACEHOLDER_QR'
  });
});

export default router;
