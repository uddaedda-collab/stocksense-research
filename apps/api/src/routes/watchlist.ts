import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { requireSupabase } from '../services/supabaseClient';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

export const watchlistRouter = Router();

watchlistRouter.use(requireAuth);

watchlistRouter.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('watchlist_items')
      .select('*')
      .eq('user_id', req.userId)
      .order('added_at', { ascending: false });
    if (error) throw new ApiError(500, error.message);
    res.json({ items: data });
  })
);

const addSchema = z.object({ symbol: z.string().min(1).max(20) });

watchlistRouter.post(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const parsed = addSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, 'symbol is required');
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('watchlist_items')
      .insert({ user_id: req.userId, symbol: parsed.data.symbol.toUpperCase() })
      .select()
      .single();
    if (error) throw new ApiError(500, error.message);
    res.status(201).json(data);
  })
);

watchlistRouter.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const supabase = requireSupabase();
    const { error } = await supabase
      .from('watchlist_items')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);
    if (error) throw new ApiError(500, error.message);
    res.status(204).send();
  })
);
