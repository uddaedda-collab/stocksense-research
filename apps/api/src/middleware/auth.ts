import type { NextFunction, Request, Response } from 'express';
import { verifyFirebaseIdToken } from '../services/firebaseAdmin';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/**
 * Verifies a Firebase ID token from the Authorization: Bearer <token> header.
 * Attaches `userId`/`userEmail` to the request on success.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header.' });
    return;
  }
  const token = header.slice('Bearer '.length);
  try {
    const decoded = await verifyFirebaseIdToken(token);
    req.userId = decoded.uid;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

/** Attaches user info if a valid token is present, but does not block the request otherwise. */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const decoded = await verifyFirebaseIdToken(header.slice('Bearer '.length));
      req.userId = decoded.uid;
      req.userEmail = decoded.email;
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}
