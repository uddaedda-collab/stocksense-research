import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { requireSupabase, supabase } from '../services/supabaseClient';
import { getApiMonitoringStats, getRecentLogs } from '../services/requestLogger';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get(
  '/dashboard',
  asyncHandler(async (_req, res) => {
    const monitoring = getApiMonitoringStats();
    let userCount = 0;
    let watchlistCount = 0;
    let portfolioCount = 0;

    if (supabase) {
      const [{ count: uc }, { count: wc }, { count: pc }] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('watchlist_items').select('*', { count: 'exact', head: true }),
        supabase.from('portfolio_holdings').select('*', { count: 'exact', head: true }),
      ]);
      userCount = uc ?? 0;
      watchlistCount = wc ?? 0;
      portfolioCount = pc ?? 0;
    }

    res.json({
      monitoring,
      userCount,
      watchlistCount,
      portfolioCount,
    });
  })
);

adminRouter.get(
  '/logs',
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit ?? 100);
    res.json({ logs: getRecentLogs(limit) });
  })
);

adminRouter.get(
  '/errors',
  asyncHandler(async (_req, res) => {
    res.json({ errors: getRecentLogs(500).filter((l) => l.is_error) });
  })
);

adminRouter.get(
  '/users',
  asyncHandler(async (req, res) => {
    const supabaseClient = requireSupabase();
    const page = Number(req.query.page ?? 1);
    const pageSize = 50;
    const { data, error, count } = await supabaseClient
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);
    if (error) throw new ApiError(500, error.message);
    res.json({ users: data, total: count ?? 0, page, pageSize });
  })
);
