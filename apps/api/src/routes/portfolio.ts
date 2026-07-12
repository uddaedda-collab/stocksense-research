import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { requireSupabase } from '../services/supabaseClient';
import { getQuote } from '../services/marketData';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

export const portfolioRouter = Router();

portfolioRouter.use(requireAuth);

portfolioRouter.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', req.userId)
      .order('buy_date', { ascending: false });
    if (error) throw new ApiError(500, error.message);

    const holdings = data ?? [];
    const enriched = await Promise.all(
      holdings.map(async (h: any) => {
        const quote = await getQuote(h.symbol).catch(() => null);
        const currentPrice = quote?.price ?? h.average_buy_price;
        const currentValue = currentPrice * h.quantity;
        const investedValue = h.average_buy_price * h.quantity;
        const pnl = currentValue - investedValue;
        const pnlPercent = investedValue !== 0 ? (pnl / investedValue) * 100 : 0;
        return {
          ...h,
          currentPrice,
          currentValue: Number(currentValue.toFixed(2)),
          investedValue: Number(investedValue.toFixed(2)),
          pnl: Number(pnl.toFixed(2)),
          pnlPercent: Number(pnlPercent.toFixed(2)),
          sector: quote ? undefined : undefined,
        };
      })
    );

    const totalInvested = enriched.reduce((sum, h) => sum + h.investedValue, 0);
    const totalCurrent = enriched.reduce((sum, h) => sum + h.currentValue, 0);
    const totalPnl = totalCurrent - totalInvested;
    const totalPnlPercent = totalInvested !== 0 ? (totalPnl / totalInvested) * 100 : 0;

    res.json({
      holdings: enriched,
      summary: {
        totalInvested: Number(totalInvested.toFixed(2)),
        totalCurrent: Number(totalCurrent.toFixed(2)),
        totalPnl: Number(totalPnl.toFixed(2)),
        totalPnlPercent: Number(totalPnlPercent.toFixed(2)),
      },
    });
  })
);

const addHoldingSchema = z.object({
  symbol: z.string().min(1).max(20),
  quantity: z.number().positive(),
  averageBuyPrice: z.number().positive(),
  buyDate: z.string().min(1),
});

portfolioRouter.post(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const parsed = addHoldingSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.errors.map((e) => e.message).join('; '));
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('portfolio_holdings')
      .insert({
        user_id: req.userId,
        symbol: parsed.data.symbol.toUpperCase(),
        quantity: parsed.data.quantity,
        average_buy_price: parsed.data.averageBuyPrice,
        buy_date: parsed.data.buyDate,
      })
      .select()
      .single();
    if (error) throw new ApiError(500, error.message);
    res.status(201).json(data);
  })
);

portfolioRouter.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const supabase = requireSupabase();
    const { error } = await supabase
      .from('portfolio_holdings')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);
    if (error) throw new ApiError(500, error.message);
    res.status(204).send();
  })
);
