import express from 'express';
import { query } from '../../db/pool.js';

const router = express.Router();

router.get('/contacts', async (req, res, next) => {
  try {
    const result = await query('select * from contacts where workspace_id=$1 order by created_at desc', [req.user.workspaceId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/leads', async (req, res, next) => {
  try {
    const result = await query('select * from leads where workspace_id=$1 order by updated_at desc', [req.user.workspaceId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
