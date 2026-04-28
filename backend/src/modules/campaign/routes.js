import express from 'express';
import { query } from '../../db/pool.js';

const router = express.Router();

router.post('/send', async (req, res, next) => {
  try {
    const { name, message, scheduleAt } = req.body;
    const result = await query(
      `insert into campaigns (workspace_id, name, message, schedule_at, status)
      values ($1, $2, $3, $4, 'scheduled') returning *`,
      [req.user.workspaceId, name, message, scheduleAt]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
