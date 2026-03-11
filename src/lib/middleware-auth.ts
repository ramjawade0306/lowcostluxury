import { NextRequest } from 'next/server';
import { verifyToken } from './auth';

export async function getUser(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const token = auth?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.type !== 'user') return null;
  return payload;
}

export async function getAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const token = auth?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.type !== 'admin') return null;
  return payload;
}
