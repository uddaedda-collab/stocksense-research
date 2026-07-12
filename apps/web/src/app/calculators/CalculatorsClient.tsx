'use client';

import { useState } from 'react';
import { apiFetch, ApiClientError } from '@/lib/apiClient';
import { formatINR } from '@/lib/format';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';

type CalculatorKey = 'sip' | 'lumpsum' | 'emi' | 'swp' | 'brokerage' | 'compound-interest' | 'retirement';

const TABS: { key: CalculatorKey; label: string }[] = [
  { key: 'sip', label: 'SIP' },
  { key: 'lumpsum', label: 'Lumpsum' },
  { key: 'emi', label: 'EMI' },
  { key: 'swp', label: 'SWP' },
  { key: 'brokerage', label: 'Brokerage' },
  { key: 'compound-interest', label: 'Compound Interest' },
  { key: 'retirement', label: 'Retirement' },
];

export function CalculatorsClient() {
  const [active, setActive] = useState<CalculatorKey>('sip');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Financial Calculators</h1>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Calculator selection">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active === tab.key}
            onClick={() => setActive(tab.key)}
            className={active === tab.key ? 'btn-primary' : 'btn-secondary'}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        {active === 'sip' && <SipCalculator />}
        {active === 'lumpsum' && <LumpsumCalculator />}
        {active === 'emi' && <EmiCalculator />}
        {active === 'swp' && <SwpCalculator />}
        {active === 'brokerage' && <BrokerageCalculator />}
        {active === 'compound-interest' && <CompoundInterestCalculator />}
        {active === 'retirement' && <RetirementCalculator />}
      </div>

      <DisclaimerBox text="Calculator results are illustrative estimates based on the inputs provided and standard financial formulas. Actual returns, taxes, and charges may vary. Not investment advice." />
    </div>
  );
}

function useCalculator<TResult>(path: string) {
  const [result, setResult] = useState<TResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<TResult>(`/api/calculators/${path}`, { method: 'POST', body });
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return { result, loading, error, run };
}

function Field({
  label,
  value,
  onChange,
  step = 'any',
  min,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: string;
  min?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-600 dark:text-gray-300">{label}</span>
      <input
        type="number"
        className="input-field"
        value={value}
        step={step}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

interface SIPResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
}

function SipCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [annualReturnPercent, setAnnualReturnPercent] = useState(12);
  const [years, setYears] = useState(10);
  const { result, loading, error, run } = useCalculator<SIPResult>('sip');

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        run({ monthlyInvestment, annualReturnPercent, years });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Monthly Investment (₹)" value={monthlyInvestment} onChange={setMonthlyInvestment} min={100} />
        <Field label="Expected Annual Return (%)" value={annualReturnPercent} onChange={setAnnualReturnPercent} />
        <Field label="Investment Period (Years)" value={years} onChange={setYears} min={1} />
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
          <ResultRow label="Invested Amount" value={formatINR(result.investedAmount, 0)} />
          <ResultRow label="Estimated Returns" value={formatINR(result.estimatedReturns, 0)} />
          <ResultRow label="Total Value" value={formatINR(result.totalValue, 0)} />
        </div>
      )}
    </form>
  );
}

interface LumpsumResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
}

function LumpsumCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [annualReturnPercent, setAnnualReturnPercent] = useState(12);
  const [years, setYears] = useState(10);
  const { result, loading, error, run } = useCalculator<LumpsumResult>('lumpsum');

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        run({ principal, annualReturnPercent, years });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Investment Amount (₹)" value={principal} onChange={setPrincipal} min={1000} />
        <Field label="Expected Annual Return (%)" value={annualReturnPercent} onChange={setAnnualReturnPercent} />
        <Field label="Investment Period (Years)" value={years} onChange={setYears} min={1} />
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
          <ResultRow label="Invested Amount" value={formatINR(result.investedAmount, 0)} />
          <ResultRow label="Estimated Returns" value={formatINR(result.estimatedReturns, 0)} />
          <ResultRow label="Total Value" value={formatINR(result.totalValue, 0)} />
        </div>
      )}
    </form>
  );
}

interface EMIResult {
  emi: number;
  totalInterest: number;
  totalPayment: number;
}

function EmiCalculator() {
  const [loanAmount, setLoanAmount] = useState(2000000);
  const [annualInterestRatePercent, setAnnualInterestRatePercent] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);
  const { result, loading, error, run } = useCalculator<EMIResult>('emi');

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        run({ loanAmount, annualInterestRatePercent, tenureYears });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Loan Amount (₹)" value={loanAmount} onChange={setLoanAmount} min={1000} />
        <Field label="Annual Interest Rate (%)" value={annualInterestRatePercent} onChange={setAnnualInterestRatePercent} />
        <Field label="Tenure (Years)" value={tenureYears} onChange={setTenureYears} min={1} />
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
          <ResultRow label="Monthly EMI" value={formatINR(result.emi, 0)} />
          <ResultRow label="Total Interest" value={formatINR(result.totalInterest, 0)} />
          <ResultRow label="Total Payment" value={formatINR(result.totalPayment, 0)} />
        </div>
      )}
    </form>
  );
}

interface SWPResult {
  totalWithdrawn: number;
  finalCorpus: number;
  corpusDepletedAtMonth: number | null;
}

function SwpCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(1000000);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(10000);
  const [annualReturnPercent, setAnnualReturnPercent] = useState(8);
  const [years, setYears] = useState(10);
  const { result, loading, error, run } = useCalculator<SWPResult>('swp');

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        run({ initialInvestment, monthlyWithdrawal, annualReturnPercent, years });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Initial Investment (₹)" value={initialInvestment} onChange={setInitialInvestment} min={1000} />
        <Field label="Monthly Withdrawal (₹)" value={monthlyWithdrawal} onChange={setMonthlyWithdrawal} min={100} />
        <Field label="Expected Annual Return (%)" value={annualReturnPercent} onChange={setAnnualReturnPercent} />
        <Field label="Duration (Years)" value={years} onChange={setYears} min={1} />
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
          <ResultRow label="Total Withdrawn" value={formatINR(result.totalWithdrawn, 0)} />
          <ResultRow label="Final Corpus" value={formatINR(result.finalCorpus, 0)} />
          <ResultRow
            label="Corpus Depleted At"
            value={result.corpusDepletedAtMonth ? `Month ${result.corpusDepletedAtMonth}` : 'Not depleted'}
          />
        </div>
      )}
    </form>
  );
}

interface BrokerageResult {
  turnover: number;
  totalCharges: number;
  netAmount: number;
}

function BrokerageCalculator() {
  const [buyPrice, setBuyPrice] = useState(100);
  const [sellPrice, setSellPrice] = useState(110);
  const [quantity, setQuantity] = useState(100);
  const [tradeType, setTradeType] = useState<'delivery' | 'intraday'>('delivery');
  const { result, loading, error, run } = useCalculator<BrokerageResult>('brokerage');

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        run({ buyPrice, sellPrice, quantity, tradeType });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Buy Price (₹)" value={buyPrice} onChange={setBuyPrice} min={0.01} />
        <Field label="Sell Price (₹)" value={sellPrice} onChange={setSellPrice} min={0.01} />
        <Field label="Quantity" value={quantity} onChange={setQuantity} min={1} step="1" />
        <label className="block text-sm">
          <span className="mb-1 block text-gray-600 dark:text-gray-300">Trade Type</span>
          <select
            className="input-field"
            value={tradeType}
            onChange={(e) => setTradeType(e.target.value as 'delivery' | 'intraday')}
          >
            <option value="delivery">Delivery</option>
            <option value="intraday">Intraday</option>
          </select>
        </label>
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
          <ResultRow label="Turnover" value={formatINR(result.turnover, 0)} />
          <ResultRow label="Total Charges" value={formatINR(result.totalCharges, 0)} />
          <ResultRow label="Net P&L" value={formatINR(result.netAmount, 0)} />
        </div>
      )}
    </form>
  );
}

interface CompoundInterestResult {
  principal: number;
  totalInterest: number;
  totalValue: number;
}

function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [annualRatePercent, setAnnualRatePercent] = useState(8);
  const [years, setYears] = useState(5);
  const [compoundingFrequencyPerYear, setCompoundingFrequencyPerYear] = useState(4);
  const { result, loading, error, run } = useCalculator<CompoundInterestResult>('compound-interest');

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        run({ principal, annualRatePercent, years, compoundingFrequencyPerYear });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Principal (₹)" value={principal} onChange={setPrincipal} min={1000} />
        <Field label="Annual Rate (%)" value={annualRatePercent} onChange={setAnnualRatePercent} />
        <Field label="Duration (Years)" value={years} onChange={setYears} min={1} />
        <Field
          label="Compounding Frequency / Year"
          value={compoundingFrequencyPerYear}
          onChange={setCompoundingFrequencyPerYear}
          min={1}
          step="1"
        />
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
          <ResultRow label="Principal" value={formatINR(result.principal, 0)} />
          <ResultRow label="Total Interest" value={formatINR(result.totalInterest, 0)} />
          <ResultRow label="Total Value" value={formatINR(result.totalValue, 0)} />
        </div>
      )}
    </form>
  );
}

interface RetirementResult {
  totalCorpusRequired: number;
  projectedCorpus: number;
  shortfallOrSurplus: number;
  monthlyInvestmentNeeded: number;
}

function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [monthlyExpensesToday, setMonthlyExpensesToday] = useState(50000);
  const [inflationPercent, setInflationPercent] = useState(6);
  const [postRetirementYears, setPostRetirementYears] = useState(25);
  const [expectedReturnPercent, setExpectedReturnPercent] = useState(12);
  const [currentSavings, setCurrentSavings] = useState(500000);
  const [monthlyInvestment, setMonthlyInvestment] = useState(15000);
  const { result, loading, error, run } = useCalculator<RetirementResult>('retirement');

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        run({
          currentAge,
          retirementAge,
          monthlyExpensesToday,
          inflationPercent,
          postRetirementYears,
          expectedReturnPercent,
          currentSavings,
          monthlyInvestment,
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Current Age" value={currentAge} onChange={setCurrentAge} min={15} step="1" />
        <Field label="Retirement Age" value={retirementAge} onChange={setRetirementAge} min={16} step="1" />
        <Field label="Monthly Expenses Today (₹)" value={monthlyExpensesToday} onChange={setMonthlyExpensesToday} min={1000} />
        <Field label="Inflation (%)" value={inflationPercent} onChange={setInflationPercent} />
        <Field label="Years in Retirement" value={postRetirementYears} onChange={setPostRetirementYears} min={1} step="1" />
        <Field label="Expected Return (%)" value={expectedReturnPercent} onChange={setExpectedReturnPercent} />
        <Field label="Current Savings (₹)" value={currentSavings} onChange={setCurrentSavings} min={0} />
        <Field label="Current Monthly Investment (₹)" value={monthlyInvestment} onChange={setMonthlyInvestment} min={0} />
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50 sm:grid-cols-4">
          <ResultRow label="Corpus Required" value={formatINR(result.totalCorpusRequired, 0)} />
          <ResultRow label="Projected Corpus" value={formatINR(result.projectedCorpus, 0)} />
          <ResultRow
            label={result.shortfallOrSurplus >= 0 ? 'Surplus' : 'Shortfall'}
            value={formatINR(Math.abs(result.shortfallOrSurplus), 0)}
          />
          <ResultRow label="Monthly SIP Needed" value={formatINR(result.monthlyInvestmentNeeded, 0)} />
        </div>
      )}
    </form>
  );
}
