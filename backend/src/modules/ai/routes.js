import express from 'express';
import { z } from 'zod';
import { query } from '../../db/pool.js';
import { generateAIReply } from '../../services/ai.service.js';

const router = express.Router();
const emptyEmbedding = `[${'0,'.repeat(1535)}0]`;

const chatSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1),
  mode: z.enum(['sales', 'support']).default('sales'),
  language: z.string().default('en')
});

router.post('/chat', async (req, res, next) => {
  try {
    const body = chatSchema.parse(req.body);

    const ownership = await query(
      `select id from conversations where id = $1 and workspace_id = $2`,
      [body.conversationId, req.user.workspaceId]
    );

    if (ownership.rowCount === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const contextResult = await query(
      `select m.sender_type, m.content
       from messages m
       join conversations c on c.id = m.conversation_id
       where m.conversation_id = $1 and c.workspace_id = $2
       order by m.created_at desc
       limit 12`,
      [body.conversationId, req.user.workspaceId]
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
       select c.id, 'ai', $2, 'website'
       from conversations c
       where c.id = $1 and c.workspace_id = $3
       returning *`,
      [body.conversationId, reply, req.user.workspaceId]
    );

    if (saved.rowCount === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    await query(
      `update conversations
       set updated_at = now()
       where id = $1 and workspace_id = $2`,
      [body.conversationId, req.user.workspaceId]
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
      values ($1, $2, $3, $4::vector)`,
      [req.user.workspaceId, kb.rows[0].id, sourceContent.slice(0, 1500), emptyEmbedding]
    );

    res.status(201).json(kb.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
