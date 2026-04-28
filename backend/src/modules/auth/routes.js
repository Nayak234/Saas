import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../../db/pool.js';
import { env } from '../../config/env.js';

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  workspaceName: z.string().min(2)
});

router.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const hash = await bcrypt.hash(body.password, 10);

    const wsResult = await query(
      'insert into workspaces (name) values ($1) returning id',
      [body.workspaceName]
    );
    const workspaceId = wsResult.rows[0].id;

    const userResult = await query(
      'insert into users (name, email, password_hash) values ($1, $2, $3) returning id, email, name',
      [body.name, body.email, hash]
    );

    const user = userResult.rows[0];
    await query(
      'insert into memberships (workspace_id, user_id, role) values ($1, $2, $3)',
      [workspaceId, user.id, 'admin']
    );

    const token = jwt.sign({ userId: user.id, workspaceId, role: 'admin' }, env.jwtSecret, { expiresIn: '7d' });
    res.status(201).json({ token, user: { ...user, role: 'admin', workspaceId } });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userResult = await query('select id, email, name, password_hash from users where email = $1', [email]);
    const user = userResult.rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const membershipResult = await query(
      'select workspace_id, role from memberships where user_id = $1 order by created_at asc limit 1',
      [user.id]
    );

    const membership = membershipResult.rows[0];
    const token = jwt.sign(
      { userId: user.id, workspaceId: membership.workspace_id, role: membership.role },
      env.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, ...membership } });
  } catch (err) {
    next(err);
  }
});

export default router;
