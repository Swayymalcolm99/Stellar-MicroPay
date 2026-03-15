/**
 * components/WalletConnect.tsx
 * Wallet connection UI — shown when no wallet is connected.
 */

import { useState } from "react";
import { connectWallet, isFreighterInstalled } from "@/lib/wallet";

interface WalletConnectProps {
  onConnect: (publicKey: string) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    const installed = await isFreighterInstalled();
    if (!installed) {
      setError(null);
      // Open Freighter install page
      window.open("https://freighter.app", "_blank");
      setLoading(false);
      return;
    }

    const { publicKey, error: walletError } = await connectWallet();
    setLoading(false);

    if (walletError) {
      setError(walletError);
      return;
    }

    if (publicKey) {
      onConnect(publicKey);
    }
  };

  return (
    <div className="card max-w-md mx-auto text-center animate-slide-up">
      {/* Icon */}
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-stellar-500/10 border border-stellar-500/20 flex items-center justify-center">
        <WalletIcon className="w-8 h-8 text-stellar-400" />
      </div>

      <h2 className="font-display text-xl font-semibold text-white mb-2">
        Connect your wallet
      </h2>
      <p className="text-slate-400 text-sm mb-6 leading-relaxed">
        Stellar MicroPay uses{" "}
        <a
          href="https://freighter.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-stellar-400 hover:text-stellar-300 underline underline-offset-2"
        >
          Freighter
        </a>
        , a browser wallet for the Stellar network. Connect to start sending payments.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-left">
          {error}
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Spinner />
            Connecting...
          </>
        ) : (
          <>
            <WalletIcon className="w-4 h-4" />
            Connect Freighter Wallet
          </>
        )}
      </button>

      <p className="mt-4 text-xs text-slate-500">
        Don&apos;t have Freighter?{" "}
        <a
          href="https://freighter.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-stellar-400 hover:underline"
        >
          Install the extension →
        </a>
      </p>

      {/* Network indicator */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-slate-500">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Connected to{" "}
        <span className="font-mono text-slate-400">
          {process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet"}
        </span>
      </div>
    </div>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
