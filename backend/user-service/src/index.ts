import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/users', async (req, res) => {
  const result = UserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error.flatten());
  }
  try {
    const user = await prisma.user.create({ data: result.data });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`User service listening on port ${PORT}`);
});
