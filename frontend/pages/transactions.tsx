/**
 * pages/transactions.tsx
 * Full transaction history page.
 */

import { useRouter } from "next/router";
import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";
import TransactionList from "@/components/TransactionList";
import { shortenAddress } from "@/lib/stellar";

interface TransactionsProps {
  publicKey: string | null;
  onConnect: (pk: string) => void;
}

export default function Transactions({ publicKey, onConnect }: TransactionsProps) {
  const router = useRouter();

  if (!publicKey) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold text-white mb-3">
            Transaction History
          </h1>
          <p className="text-slate-400">Connect your wallet to view your payments</p>
        </div>
        <WalletConnect onConnect={onConnect} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Transaction History
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Account:</span>
            <span className="address-pill">{shortenAddress(publicKey)}</span>
          </div>
        </div>
        <Link href="/dashboard" className="btn-secondary text-sm py-2 px-4">
          ← Dashboard
        </Link>
      </div>

      {/* Export hint */}
      <div className="mb-5 p-3 rounded-xl bg-stellar-500/5 border border-stellar-500/15 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Showing your 50 most recent payments. Click any transaction to view it on Stellar Expert.
        </p>
        <a
          href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-stellar-400 hover:text-stellar-300 transition-colors whitespace-nowrap ml-4"
        >
          Full history →
        </a>
      </div>

      {/* Full transaction list */}
      <TransactionList publicKey={publicKey} limit={50} />
    </div>
  );
}
