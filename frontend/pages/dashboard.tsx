/**
 * pages/dashboard.tsx
 * Main app dashboard: wallet info, balance, send payment form.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";
import SendPaymentForm from "@/components/SendPaymentForm";
import TransactionList from "@/components/TransactionList";
import Toast from "@/components/Toast";
import QRCodeModal from "@/components/QRCodeModal";
import { getXLMBalance, fundWithFriendbot, ACCOUNT_NOT_FOUND_ERROR } from "@/lib/stellar";
import { formatUSD, copyToClipboard } from "@/utils/format";
import { useToast } from "@/lib/useToast";

interface DashboardProps {
  publicKey: string | null;
  onConnect: (pk: string) => void;
}

interface PaymentStats {
  publicKey: string;
  totalSentXLM: string;
  totalReceivedXLM: string;
  sentCount: number;
  receivedCount: number;
  totalTransactions: number;
}

export default function Dashboard({ publicKey, onConnect }: DashboardProps) {
  const [xlmBalance, setXlmBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [xlmPrice, setXlmPrice] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { visible: toastVisible, message: toastMessage, showToast } = useToast();
  const [showQRModal, setShowQRModal] = useState(false);

  const isTestnet = process.env.NEXT_PUBLIC_STELLAR_NETWORK !== "mainnet";
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [friendbotLoading, setFriendbotLoading] = useState(false);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [paymentStatsLoading, setPaymentStatsLoading] = useState(false);
  const [paymentStatsError, setPaymentStatsError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;
    setBalanceLoading(true);
    setAccountNotFound(false);
    try {
      const bal = await getXLMBalance(publicKey);
      setXlmBalance(bal);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === ACCOUNT_NOT_FOUND_ERROR) {
        setAccountNotFound(true);
      }
      setXlmBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  }, [publicKey]);

  const handleFriendbot = async () => {
    if (!publicKey) return;
    setFriendbotLoading(true);
    try {
      await fundWithFriendbot(publicKey);
      showToast("Account funded! Refreshing balance...");
      // Give Horizon a moment to index the new account
      setTimeout(() => setRefreshKey((k) => k + 1), 2000);
    } catch {
      showToast("Friendbot funding failed. Please try again.");
    } finally {
      setFriendbotLoading(false);
    }
  };

  const fetchPaymentStats = useCallback(async () => {
    if (!publicKey) return;

    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

    setPaymentStatsLoading(true);
    setPaymentStatsError(null);

    try {
      const response = await fetch(
        `${apiBase}/api/payments/${encodeURIComponent(publicKey)}/stats`
      );

      if (!response.ok) {
        throw new Error("Unable to load payment stats right now.");
      }

      const payload = await response.json();
      const data = payload?.data;

      if (
        !payload?.success ||
        !data ||
        typeof data.totalSentXLM !== "string" ||
        typeof data.totalReceivedXLM !== "string" ||
        typeof data.totalTransactions !== "number"
      ) {
        throw new Error("Payment stats response was invalid.");
      }

      setPaymentStats({
        publicKey: data.publicKey,
        totalSentXLM: data.totalSentXLM,
        totalReceivedXLM: data.totalReceivedXLM,
        sentCount: Number(data.sentCount ?? 0),
        receivedCount: Number(data.receivedCount ?? 0),
        totalTransactions: data.totalTransactions,
      });
    } catch {
      setPaymentStats(null);
      setPaymentStatsError("Could not load your payment stats.");
    } finally {
      setPaymentStatsLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance, refreshKey]);

  useEffect(() => {
    fetchPaymentStats();
  }, [fetchPaymentStats, refreshKey]);

  // Fetch XLM/USD price from CoinGecko — fails silently
  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd")
      .then((res) => res.json())
      .then((data) => setXlmPrice(data?.stellar?.usd ?? null))
      .catch(() => setXlmPrice(null));
  }, [refreshKey]);

  const handleCopyAddress = async () => {
    if (!publicKey) return;
    const ok = await copyToClipboard(publicKey);
    if (ok) showToast("Address copied!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentSuccess = () => {
    // Refresh balance and transactions after a payment
    setTimeout(() => {
      setRefreshKey((k) => k + 1);
    }, 2000);
  };

  if (!publicKey) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold text-white mb-3">
            Dashboard
          </h1>
          <p className="text-slate-400">Connect your wallet to get started</p>
        </div>
        <WalletConnect onConnect={onConnect} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-slate-400 text-sm">Send and receive XLM globally</p>
      </div>

      <PaymentStatsWidget
        stats={paymentStats}
        loading={paymentStatsLoading}
        error={paymentStatsError}
        onRetry={fetchPaymentStats}
      />

      {/* Wallet card */}
      <div className="card mb-6 bg-gradient-to-br from-cosmos-800 to-cosmos-900 border-stellar-500/20 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-stellar-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="label mb-1">Wallet Address</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-slate-300 break-all">
                {publicKey}
              </span>
            </div>
            <button
              onClick={handleCopyAddress}
              className="mt-2 text-xs text-stellar-400 hover:text-stellar-300 transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon className="w-3.5 h-3.5" />
                  Copy address
                </>
              )}
            </button>
          </div>

          {/* Balance */}
          <div className="sm:text-right flex-shrink-0">
            <p className="label mb-1">XLM Balance</p>
            {balanceLoading ? (
              <div className="h-8 w-36 bg-white/10 rounded-lg animate-pulse" />
            ) : xlmBalance !== null ? (
              <div>
                <div className="font-display text-3xl font-bold text-white">
                  {parseFloat(xlmBalance).toLocaleString("en-US", {
                    maximumFractionDigits: 4,
                  })}
                  <span className="text-stellar-400 text-xl ml-2">XLM</span>
                </div>
                {xlmPrice !== null && (
                  <p className="text-sm text-slate-400 mt-0.5">
                    {formatUSD(parseFloat(xlmBalance) * xlmPrice)}
                  </p>
                )}
                <button
                  onClick={fetchBalance}
                  className="mt-1 text-xs text-slate-500 hover:text-stellar-400 transition-colors flex items-center gap-1 sm:justify-end"
                >
                  <RefreshIcon className="w-3 h-3" />
                  Refresh
                </button>
              </div>
            ) : accountNotFound && isTestnet ? (
              <div className="sm:text-right">
                <p className="text-amber-400 text-sm mb-2">Account not funded yet</p>
                <button
                  onClick={handleFriendbot}
                  disabled={friendbotLoading}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold text-sm py-2 px-4 rounded-lg transition-colors"
                >
                  {friendbotLoading ? (
                    <>
                      <SpinnerIcon className="w-4 h-4 animate-spin" />
                      Funding...
                    </>
                  ) : (
                    <>
                      <DropIcon className="w-4 h-4" />
                      Fund Testnet Account
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-slate-500 text-sm">Failed to load</p>
                <button
                  onClick={fetchBalance}
                  className="text-xs text-stellar-400 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Testnet warning */}
        {process.env.NEXT_PUBLIC_STELLAR_NETWORK !== "mainnet" && (
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-amber-400/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
            You&apos;re on <strong>Testnet</strong> — funds are not real.{" "}
            <a
              href="https://friendbot.stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-amber-300"
            >
              Get test XLM →
            </a>
          </div>
        )}
      </div>

      {/* Two-column layout: send form + recent txns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Send payment */}
        <div>
          <SendPaymentForm
            key={refreshKey}
            publicKey={publicKey}
            xlmBalance={xlmBalance || "0"}
            onSuccess={handlePaymentSuccess}
          />
        </div>

        {/* Recent transactions (compact) */}
        <div>
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
                <HistoryIcon className="w-5 h-5 text-stellar-400" />
                Recent Activity
              </h2>
              <Link
                href="/transactions"
                className="text-xs text-stellar-400 hover:text-stellar-300 transition-colors"
              >
                View all →
              </Link>
            </div>
            <TransactionList
              key={refreshKey}
              publicKey={publicKey}
              limit={5}
              compact
            />
          </div>
        </div>
      </div>
      <Toast message={toastMessage} visible={toastVisible} />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        publicKey={publicKey}
      />
    </div>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

function PaymentStatsWidget({
  stats,
  loading,
  error,
  onRetry,
}: {
  stats: PaymentStats | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6" aria-label="Payment stats loading">
        <span className="sr-only">Loading payment stats</span>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="card border-white/10 bg-white/[0.03] animate-pulse"
          >
            <div className="h-3 w-24 rounded bg-white/10 mb-3" />
            <div className="h-8 w-32 rounded bg-white/10 mb-2" />
            <div className="h-3 w-20 rounded bg-white/10" />
          </div>
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <section className="card mb-6 border-red-500/20 bg-red-500/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Payment summary</p>
            <p className="text-sm text-red-300">{error}</p>
          </div>
          <button
            onClick={onRetry}
            className="btn-secondary text-sm px-4 py-2"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!stats) return null;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
      <StatsCard
        label="Total Sent"
        value={formatStatsXLM(stats.totalSentXLM)}
        helper={`${stats.sentCount} outgoing payment${stats.sentCount === 1 ? "" : "s"}`}
      />
      <StatsCard
        label="Total Received"
        value={formatStatsXLM(stats.totalReceivedXLM, "received")}
        helper={`${stats.receivedCount} incoming payment${stats.receivedCount === 1 ? "" : "s"}`}
      />
      <StatsCard
        label="Transactions"
        value={stats.totalTransactions.toLocaleString("en-US")}
        helper="Across sent and received activity"
      />
    </section>
  );
}

function StatsCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="card border-white/10 bg-white/[0.03]">
      <p className="label mb-2">{label}</p>
      <p className="font-display text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-2">{helper}</p>
    </div>
  );
}

function formatStatsXLM(amount: string, suffix = "sent") {
  const value = parseFloat(amount);

  if (Number.isNaN(value)) return `0.00 XLM ${suffix}`;

  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  })} XLM ${suffix}`;
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M3 12h3m12 0h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
    </svg>
  );
}

function DropIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.25c-.41 0-.78.2-1.01.53l-6 8.5A7.5 7.5 0 1019.01 10.78l-6-8.5A1.25 1.25 0 0012 2.25z" />
    </svg>
  );
}
