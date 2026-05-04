import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wallet, ArrowUpRight, ArrowDownLeft, TrendingDown,
  CheckCircle, AlertTriangle, ChevronDown, FileDown,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SEO from '../../components/seo/SEO';
import { exportToCsv } from '../../utils/exportToCsv';

type ActiveTab = 'disburse' | 'withdraw' | 'disbursements' | 'withdrawals';

const DESTINATION_TYPES = [
  { value: 'bank', label: 'Bank Account' },
  { value: 'mtn_momo', label: 'MTN Mobile Money' },
  { value: 'airtel_money', label: 'Airtel Money' },
];

function formatUGX(n: number) {
  return `UGX ${n.toLocaleString()}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-UG', { dateStyle: 'medium' });
}

// ── Balance Cards ─────────────────────────────────────────────────────────────

function BalanceCards() {
  const { data, isLoading } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: adminApi.walletBalance,
  });

  const cards = [
    {
      label: 'Total Donated',
      value: data?.total_donated ?? 0,
      icon: <ArrowDownLeft size={20} className="text-emerald-600" />,
      bg: 'bg-emerald-50',
    },
    {
      label: 'Disbursed to Campaigns',
      value: data?.total_disbursed ?? 0,
      icon: <ArrowUpRight size={20} className="text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      label: 'Withdrawn',
      value: data?.total_withdrawn ?? 0,
      icon: <TrendingDown size={20} className="text-amber-600" />,
      bg: 'bg-amber-50',
    },
    {
      label: 'Available Balance',
      value: data?.balance ?? 0,
      icon: <Wallet size={20} className="text-primary-600" />,
      bg: 'bg-primary-50',
      highlight: true,
    },
  ];

  if (isLoading) {
    return <div className="flex justify-center py-8"><Spinner size="lg" /></div>;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <div
          key={c.label}
          className={`rounded-2xl border p-5 shadow-sm ${
            c.highlight
              ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
          }`}
        >
          <div className={`h-10 w-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
            {c.icon}
          </div>
          <p className="font-display text-xl font-bold text-gray-900">{formatUGX(c.value)}</p>
          <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Disburse Form ─────────────────────────────────────────────────────────────

function DisburseForm() {
  const qc = useQueryClient();
  const [campaignId, setCampaignId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { data: campaignsData } = useQuery({
    queryKey: ['walletCampaigns'],
    queryFn: adminApi.walletCampaigns,
  });
  const campaigns = campaignsData?.campaigns ?? [];

  const mutation = useMutation({
    mutationFn: () => adminApi.disburse(campaignId, Number(amount), note),
    onSuccess: () => {
      setSuccess('Funds disbursed successfully to the campaign.');
      setCampaignId(''); setAmount(''); setNote('');
      qc.invalidateQueries({ queryKey: ['walletBalance'] });
      qc.invalidateQueries({ queryKey: ['walletDisbursements'] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const handleSubmit = () => {
    setError(''); setSuccess('');
    if (!campaignId) { setError('Please select a campaign.'); return; }
    if (!amount || Number(amount) <= 0) { setError('Please enter a valid amount.'); return; }
    mutation.mutate();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
      <div>
        <h2 className="font-display text-base font-bold text-gray-900 dark:text-white">Disburse to Campaign</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Transfer funds from the general pool into a campaign that has not yet reached its target.</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Campaign *</label>
        <div className="relative">
          <select
            value={campaignId}
            onChange={e => setCampaignId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white appearance-none pr-10"
          >
            <option value="">— Choose an approved campaign —</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>
                {c.title} (UGX {c.current_amount.toLocaleString()} / {c.target_amount.toLocaleString()})
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <Input
        label="Amount (UGX) *"
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="e.g. 500000"
        min="1"
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Note <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Reason for disbursement..."
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          <AlertTriangle size={14} className="shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-700">
          <CheckCircle size={14} className="shrink-0" /> {success}
        </div>
      )}

      <Button onClick={handleSubmit} loading={mutation.isPending} className="w-full">
        <ArrowUpRight size={16} /> Disburse Funds
      </Button>
    </div>
  );
}

// ── Withdraw Form ─────────────────────────────────────────────────────────────

function WithdrawForm() {
  const qc = useQueryClient();
  const [destType, setDestType] = useState('bank');
  const [destName, setDestName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => adminApi.withdraw(Number(amount), destType, destName, accountNumber, note),
    onSuccess: () => {
      setSuccess('Withdrawal processed. Funds sent to the specified account.');
      setDestName(''); setAccountNumber(''); setAmount(''); setNote('');
      qc.invalidateQueries({ queryKey: ['walletBalance'] });
      qc.invalidateQueries({ queryKey: ['walletWithdrawals'] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const handleSubmit = () => {
    setError(''); setSuccess('');
    if (!destName.trim()) { setError('Please enter the account holder / recipient name.'); return; }
    if (!accountNumber.trim()) { setError('Please enter the account number or phone number.'); return; }
    if (!amount || Number(amount) <= 0) { setError('Please enter a valid amount.'); return; }
    mutation.mutate();
  };

  const destLabel = destType === 'bank' ? 'Account Number' : 'Phone Number';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div>
        <h2 className="font-display text-base font-bold text-gray-900">Withdraw Funds</h2>
        <p className="text-xs text-gray-500 mt-0.5">Send funds to a bank account or mobile money for community use.</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Destination Type *</label>
        <div className="relative">
          <select
            value={destType}
            onChange={e => setDestType(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white appearance-none pr-10"
          >
            {DESTINATION_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Account Holder / Recipient *"
          value={destName}
          onChange={e => setDestName(e.target.value)}
          placeholder="Full name"
        />
        <Input
          label={`${destLabel} *`}
          value={accountNumber}
          onChange={e => setAccountNumber(e.target.value)}
          placeholder={destType === 'bank' ? '0123456789' : '0770 000 000'}
        />
      </div>

      <Input
        label="Amount (UGX) *"
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="e.g. 200000"
        min="1"
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Purpose / Note <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="e.g. Community event supplies..."
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          <AlertTriangle size={14} className="shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-700">
          <CheckCircle size={14} className="shrink-0" /> {success}
        </div>
      )}

      <Button onClick={handleSubmit} loading={mutation.isPending} className="w-full">
        <TrendingDown size={16} /> Process Withdrawal
      </Button>
    </div>
  );
}

// ── Disbursements History ─────────────────────────────────────────────────────

function DisbursementsHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['walletDisbursements'],
    queryFn: adminApi.disbursements,
  });
  const rows = data?.disbursements ?? [];

  if (isLoading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (rows.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Wallet size={32} className="mx-auto mb-3 text-gray-300" />
        <p className="text-sm">No disbursements yet.</p>
      </div>
    );
  }

  function handleExport() {
    const today = new Date().toISOString().slice(0, 10);
    exportToCsv(
      rows,
      [
        { key: 'created_at', label: 'Date' },
        { key: 'campaign_title', label: 'Campaign' },
        { key: 'amount', label: 'Amount (UGX)' },
        { key: 'note', label: 'Note' },
      ],
      `campuscare-disbursements-${today}.csv`,
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <FileDown size={14} /> Export CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {['Date', 'Campaign', 'Amount', 'Note'].map(h => (
              <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(r => (
            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{formatDate(r.created_at)}</td>
              <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{r.campaign_title}</td>
              <td className="px-5 py-3.5 text-sm font-semibold text-blue-700 whitespace-nowrap">{formatUGX(r.amount)}</td>
              <td className="px-5 py-3.5 text-sm text-gray-500">{r.note || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function WithdrawalsHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['walletWithdrawals'],
    queryFn: adminApi.withdrawals,
  });
  const rows = data?.withdrawals ?? [];

  if (isLoading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (rows.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <TrendingDown size={32} className="mx-auto mb-3 text-gray-300" />
        <p className="text-sm">No withdrawals yet.</p>
      </div>
    );
  }

  const destLabel: Record<string, string> = {
    bank: 'Bank',
    mtn_momo: 'MTN MoMo',
    airtel_money: 'Airtel Money',
  };

  function handleExport() {
    const today = new Date().toISOString().slice(0, 10);
    exportToCsv(
      rows,
      [
        { key: 'created_at', label: 'Date' },
        { key: 'destination_name', label: 'Recipient' },
        { key: 'destination_type', label: 'Destination' },
        { key: 'account_number', label: 'Account' },
        { key: 'amount', label: 'Amount (UGX)' },
        { key: 'note', label: 'Note' },
      ],
      `campuscare-withdrawals-${today}.csv`,
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <FileDown size={14} /> Export CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {['Date', 'Recipient', 'Destination', 'Account', 'Amount', 'Note'].map(h => (
              <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(r => (
            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{formatDate(r.created_at)}</td>
              <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{r.destination_name}</td>
              <td className="px-5 py-3.5 text-sm text-gray-600">{destLabel[r.destination_type] ?? r.destination_type}</td>
              <td className="px-5 py-3.5 text-sm text-gray-600 font-mono">{r.account_number}</td>
              <td className="px-5 py-3.5 text-sm font-semibold text-amber-700 whitespace-nowrap">{formatUGX(r.amount)}</td>
              <td className="px-5 py-3.5 text-sm text-gray-500">{r.note || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminWalletPage() {
  const [tab, setTab] = useState<ActiveTab>('disburse');

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: 'disburse', label: 'Disburse to Campaign' },
    { key: 'withdraw', label: 'Withdraw Funds' },
    { key: 'disbursements', label: 'Disbursement History' },
    { key: 'withdrawals', label: 'Withdrawal History' },
  ];

  return (
    <div className="space-y-6">
      <SEO title="Wallet — Admin" description="Manage the CampusCare general pool wallet." noindex />

      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-1">General Pool Wallet</h1>
        <p className="text-gray-500 dark:text-gray-400">View your balance and disburse or withdraw funds from the general donation pool.</p>
      </div>

      <BalanceCards />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'disburse' && <DisburseForm />}
      {tab === 'withdraw' && <WithdrawForm />}
      {tab === 'disbursements' && <DisbursementsHistory />}
      {tab === 'withdrawals' && <WithdrawalsHistory />}
    </div>
  );
}
