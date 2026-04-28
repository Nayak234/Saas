import express from 'express';
import { query } from '../../db/pool.js';

const router = express.Router();

router.get('/overview', async (req, res, next) => {
  try {
    const workspaceId = req.user.workspaceId;
    const [revenue, aiVsHuman, conversions] = await Promise.all([
      query("select coalesce(sum(amount),0) as revenue from payments where workspace_id=$1 and status='success'", [workspaceId]),
      query(`select sender_type, count(*)::int as count from messages m
             join conversations c on c.id = m.conversation_id
             where c.workspace_id = $1 group by sender_type`, [workspaceId]),
      query(`select count(*) filter (where status='won')::int as won,
                    count(*)::int as total from leads where workspace_id = $1`, [workspaceId])
    ]);

    res.json({
      revenue: Number(revenue.rows[0].revenue),
      aiVsHuman: aiVsHuman.rows,
      conversionRate: conversions.rows[0].total ? (conversions.rows[0].won / conversions.rows[0].total) * 100 : 0
    });
  } catch (err) {
    next(err);
  }
});

export default router;
