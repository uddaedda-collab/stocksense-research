import type { NextFunction, Response } from 'express';
import { env } from '../config/env';
import type { AuthenticatedRequest } from './auth';

/** Restricts access to users whose Firebase email is present in ADMIN_EMAILS. Must run after requireAuth. */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const email = req.userEmail?.toLowerCase();
  if (!email || !env.ADMIN_EMAILS.includes(email)) {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }
  next();
}
