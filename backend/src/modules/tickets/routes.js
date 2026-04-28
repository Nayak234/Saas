import express from 'express';
import { query } from '../../db/pool.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { conversationId, title, priority = 'medium' } = req.body;
    const result = await query(
      `insert into tickets (workspace_id, conversation_id, title, priority, status, sla_due_at)
      values ($1, $2, $3, $4, 'open', now() + interval '4 hours') returning *`,
      [req.user.workspaceId, conversationId, title, priority]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const result = await query('select * from tickets where workspace_id=$1 order by created_at desc', [req.user.workspaceId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
