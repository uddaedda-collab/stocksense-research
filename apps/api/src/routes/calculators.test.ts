import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('POST /api/calculators/sip', () => {
  it('computes SIP results for valid input', async () => {
    const res = await request(app)
      .post('/api/calculators/sip')
      .send({ monthlyInvestment: 5000, annualReturnPercent: 12, years: 10 });
    expect(res.status).toBe(200);
    expect(res.body.investedAmount).toBe(600000);
    expect(res.body.totalValue).toBeGreaterThan(600000);
  });

  it('rejects invalid input with 400', async () => {
    const res = await request(app)
      .post('/api/calculators/sip')
      .send({ monthlyInvestment: -100, annualReturnPercent: 12, years: 10 });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/calculators/emi', () => {
  it('computes EMI results for valid input', async () => {
    const res = await request(app)
      .post('/api/calculators/emi')
      .send({ loanAmount: 1000000, annualInterestRatePercent: 8.5, tenureYears: 20 });
    expect(res.status).toBe(200);
    expect(res.body.emi).toBeGreaterThan(0);
  });
});

describe('POST /api/calculators/brokerage', () => {
  it('computes brokerage for a delivery trade', async () => {
    const res = await request(app)
      .post('/api/calculators/brokerage')
      .send({ buyPrice: 100, sellPrice: 110, quantity: 10, tradeType: 'delivery' });
    expect(res.status).toBe(200);
    expect(res.body.brokerage).toBe(0);
  });

  it('rejects invalid tradeType', async () => {
    const res = await request(app)
      .post('/api/calculators/brokerage')
      .send({ buyPrice: 100, sellPrice: 110, quantity: 10, tradeType: 'weekly' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/calculators/retirement', () => {
  it('rejects retirementAge <= currentAge', async () => {
    const res = await request(app)
      .post('/api/calculators/retirement')
      .send({
        currentAge: 40,
        retirementAge: 35,
        monthlyExpensesToday: 50000,
        inflationPercent: 6,
        postRetirementYears: 25,
        expectedReturnPercent: 12,
        currentSavings: 100000,
        monthlyInvestment: 10000,
      });
    expect(res.status).toBe(400);
  });
});

describe('unknown routes', () => {
  it('returns 404 for unknown route', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
  });
});

describe('GET /health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
