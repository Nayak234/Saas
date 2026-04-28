import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { query } from '../../db/pool.js';
import { generateUPILink } from '../../utils/upi.js';

const router = express.Router();
const upload = multer({ dest: 'tmp/' });

router.post('/create', async (req, res, next) => {
  try {
    const schema = z.object({ contactId: z.string().uuid(), amount: z.number().positive() });
    const { contactId, amount } = schema.parse(req.body);
    const upiLink = generateUPILink(amount);
    const result = await query(
      `insert into payments (workspace_id, contact_id, amount, status, upi_link)
      values ($1, $2, $3, 'pending', $4) returning *`,
      [req.user.workspaceId, contactId, amount, upiLink]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/confirm', upload.single('screenshot'), async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const screenshotUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await query(
      `update payments
       set status = 'verification_pending', screenshot_url = $2, updated_at = now()
       where id = $1 and workspace_id = $3
       returning *`,
      [paymentId, screenshotUrl, req.user.workspaceId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const schema = z.object({ paymentId: z.string().uuid(), status: z.enum(['success', 'failed']) });
    const { paymentId, status } = schema.parse(req.body);
    const result = await query(
      `update payments
       set status = $2, verified_by = $3, updated_at = now()
       where id = $1 and workspace_id = $4
       returning *`,
      [paymentId, status, req.user.userId, req.user.workspaceId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
