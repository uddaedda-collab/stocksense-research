import { Router } from 'express';
import { z } from 'zod';
import {
  calculateBrokerage,
  calculateCompoundInterest,
  calculateEMI,
  calculateLumpsum,
  calculateRetirement,
  calculateSIP,
  calculateSWP,
} from '@platform/shared';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

export const calculatorsRouter = Router();

function validate<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.errors.map((e) => e.message).join('; '));
  }
  return result.data;
}

const sipSchema = z.object({
  monthlyInvestment: z.number().positive(),
  annualReturnPercent: z.number(),
  years: z.number().positive().max(60),
});
calculatorsRouter.post(
  '/sip',
  asyncHandler(async (req, res) => {
    const input = validate(sipSchema, req.body);
    res.json(calculateSIP(input.monthlyInvestment, input.annualReturnPercent, input.years));
  })
);

const lumpsumSchema = z.object({
  principal: z.number().positive(),
  annualReturnPercent: z.number(),
  years: z.number().positive().max(60),
});
calculatorsRouter.post(
  '/lumpsum',
  asyncHandler(async (req, res) => {
    const input = validate(lumpsumSchema, req.body);
    res.json(calculateLumpsum(input.principal, input.annualReturnPercent, input.years));
  })
);

const brokerageSchema = z.object({
  buyPrice: z.number().positive(),
  sellPrice: z.number().positive(),
  quantity: z.number().int().positive(),
  tradeType: z.enum(['delivery', 'intraday']),
});
calculatorsRouter.post(
  '/brokerage',
  asyncHandler(async (req, res) => {
    const input = validate(brokerageSchema, req.body);
    res.json(calculateBrokerage(input.buyPrice, input.sellPrice, input.quantity, input.tradeType));
  })
);

const compoundInterestSchema = z.object({
  principal: z.number().positive(),
  annualRatePercent: z.number(),
  years: z.number().positive().max(60),
  compoundingFrequencyPerYear: z.number().int().positive().max(365).optional(),
});
calculatorsRouter.post(
  '/compound-interest',
  asyncHandler(async (req, res) => {
    const input = validate(compoundInterestSchema, req.body);
    res.json(
      calculateCompoundInterest(
        input.principal,
        input.annualRatePercent,
        input.years,
        input.compoundingFrequencyPerYear
      )
    );
  })
);

const retirementSchema = z.object({
  currentAge: z.number().int().min(15).max(80),
  retirementAge: z.number().int().min(16).max(90),
  monthlyExpensesToday: z.number().positive(),
  inflationPercent: z.number(),
  postRetirementYears: z.number().positive().max(60),
  expectedReturnPercent: z.number(),
  currentSavings: z.number().nonnegative(),
  monthlyInvestment: z.number().nonnegative(),
});
calculatorsRouter.post(
  '/retirement',
  asyncHandler(async (req, res) => {
    const input = validate(retirementSchema, req.body);
    if (input.retirementAge <= input.currentAge) {
      throw new ApiError(400, 'retirementAge must be greater than currentAge');
    }
    res.json(calculateRetirement(input));
  })
);

const swpSchema = z.object({
  initialInvestment: z.number().positive(),
  monthlyWithdrawal: z.number().positive(),
  annualReturnPercent: z.number(),
  years: z.number().positive().max(60),
});
calculatorsRouter.post(
  '/swp',
  asyncHandler(async (req, res) => {
    const input = validate(swpSchema, req.body);
    res.json(calculateSWP(input.initialInvestment, input.monthlyWithdrawal, input.annualReturnPercent, input.years));
  })
);

const emiSchema = z.object({
  loanAmount: z.number().positive(),
  annualInterestRatePercent: z.number().nonnegative(),
  tenureYears: z.number().positive().max(40),
});
calculatorsRouter.post(
  '/emi',
  asyncHandler(async (req, res) => {
    const input = validate(emiSchema, req.body);
    res.json(calculateEMI(input.loanAmount, input.annualInterestRatePercent, input.tenureYears));
  })
);
