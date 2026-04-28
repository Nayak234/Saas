import express from 'express';
import { z } from 'zod';
import { query } from '../../db/pool.js';
import { generateAIReply } from '../../services/ai.service.js';

const router = express.Router();

const chatSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1),
  mode: z.enum(['sales', 'support']).default('sales'),
  language: z.string().default('en')
});

router.post('/chat', async (req, res, next) => {
  try {
    const body = chatSchema.parse(req.body);
    const contextResult = await query(
      `select sender_type, content from messages
      where conversation_id = $1
      order by created_at desc limit 12`,
      [body.conversationId]
    );

    const context = contextResult.rows.reverse().map((m) => ({
      role: m.sender_type === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    const reply = await generateAIReply({
      mode: body.mode,
      language: body.language,
      conversationContext: context,
      userMessage: body.message
    });

    const saved = await query(
      `insert into messages (conversation_id, sender_type, content, channel)
       values ($1, 'ai', $2, 'website') returning *`,
      [body.conversationId, reply]
    );

    req.io.to(body.conversationId).emit('message:new', saved.rows[0]);
    res.json(saved.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/train', async (req, res, next) => {
  try {
    const { sourceType, sourceContent, title } = req.body;
    const kb = await query(
      `insert into knowledge_base (workspace_id, title, source_type, source_content)
      values ($1, $2, $3, $4) returning *`,
      [req.user.workspaceId, title, sourceType, sourceContent]
    );

    await query(
      `insert into embeddings (workspace_id, knowledge_base_id, chunk_text, embedding)
      values ($1, $2, $3, $4)`,
      [req.user.workspaceId, kb.rows[0].id, sourceContent.slice(0, 1500), JSON.stringify([])]
    );

    res.status(201).json(kb.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
