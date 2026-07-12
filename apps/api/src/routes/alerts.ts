import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { requireSupabase } from '../services/supabaseClient';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

export const alertsRouter = Router();

alertsRouter.use(requireAuth);

alertsRouter.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });
    if (error) throw new ApiError(500, error.message);
    res.json({ alerts: data });
  })
);

const createAlertSchema = z.object({
  symbol: z.string().min(1).max(20),
  targetPrice: z.number().positive(),
  direction: z.enum(['above', 'below']),
});

alertsRouter.post(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const parsed = createAlertSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.errors.map((e) => e.message).join('; '));
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('price_alerts')
      .insert({
        user_id: req.userId,
        symbol: parsed.data.symbol.toUpperCase(),
        target_price: parsed.data.targetPrice,
        direction: parsed.data.direction,
        triggered: false,
      })
      .select()
      .single();
    if (error) throw new ApiError(500, error.message);
    res.status(201).json(data);
  })
);

alertsRouter.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const supabase = requireSupabase();
    const { error } = await supabase
      .from('price_alerts')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);
    if (error) throw new ApiError(500, error.message);
    res.status(204).send();
  })
);
