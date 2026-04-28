import express from 'express';
import { z } from 'zod';
import { query } from '../../db/pool.js';

const router = express.Router();

router.get('/conversations', async (req, res, next) => {
  try {
    const result = await query(
      `select c.*, ct.name as contact_name
       from conversations c
       join contacts ct on ct.id = c.contact_id
       where c.workspace_id = $1
       order by c.updated_at desc`,
      [req.user.workspaceId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

const sendSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1),
  channel: z.enum(['whatsapp', 'website']).default('website')
});

router.post('/messages/send', async (req, res, next) => {
  try {
    const body = sendSchema.parse(req.body);
    const ownership = await query(
      `select id from conversations where id = $1 and workspace_id = $2`,
      [body.conversationId, req.user.workspaceId]
    );

    if (ownership.rowCount === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const result = await query(
      `insert into messages (conversation_id, sender_type, content, channel)
       values ($1, 'agent', $2, $3)
       returning *`,
      [body.conversationId, body.content, body.channel]
    );

    await query(
      `update conversations
       set updated_at = now()
       where id = $1 and workspace_id = $2`,
      [body.conversationId, req.user.workspaceId]
    );

    req.io.to(body.conversationId).emit('message:new', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
