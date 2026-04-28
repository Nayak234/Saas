import express from 'express';

const router = express.Router();

router.get('/connect', (req, res) => {
  res.json({
    provider: 'baileys',
    status: 'pending_qr_scan',
    qrCode: 'data:image/png;base64,PLACEHOLDER_QR'
  });
});

router.post('/webhook', async (req, res) => {
  const incoming = req.body;
  req.io.emit('whatsapp:incoming', incoming);
  res.json({ received: true });
});

export default router;
