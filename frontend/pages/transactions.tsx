/**
 * pages/transactions.tsx
 * Full transaction history page with UX cursor fixes.
 */

import { useRouter } from "next/router";
import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";
import TransactionList from "@/components/TransactionList";
import { shortenAddress, PaymentRecord } from "@/lib/stellar";
import { exportToCSV, formatDate, formatXLM } from "@/utils/format";
import { useCallback, useEffect, useState } from "react";

interface TransactionsProps {
  publicKey: string | null;
  onConnect: (pk: string) => void;
}

export default function Transactions({ publicKey, onConnect }: TransactionsProps) {
  const router = useRouter();
  const networkLabel =
    process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet" ? "Mainnet" : "Testnet";

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [exporting, setExporting] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<PaymentRecord | null>(null);

  // Receives the latest payments array from the list whenever it changes
  const handlePaymentsChange = useCallback((records: PaymentRecord[]) => {
    setPayments(records);
  }, []);

  const handleExport = () => {
    if (payments.length === 0) return;
    setExporting(true);
    try {
      exportToCSV(payments);
    } finally {
      // Small delay so the button flash feels intentional
      setTimeout(() => setExporting(false), 800);
    }
  };

  const handlePrintReceipt = useCallback((payment: PaymentRecord) => {
    setReceiptPayment(payment);
  }, []);

  useEffect(() => {
    if (!receiptPayment) return;

    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;

    const cleanup = () => {
      document.body.classList.remove("receipt-printing");
      setReceiptPayment(null);
    };

    const handleAfterPrint = () => {
      if (cancelled) return;
      cleanup();
    };

    document.body.classList.add("receipt-printing");
    window.addEventListener("afterprint", handleAfterPrint);

    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        if (!cancelled) {
          window.print();
        }
      });
    });

    return () => {
      cancelled = true;
      window.removeEventListener("afterprint", handleAfterPrint);
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      document.body.classList.remove("receipt-printing");
    };
  }, [receiptPayment]);

  if (!publicKey) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 cursor-default select-none">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold text-white mb-3">
            {`Transaction History`}
          </h1>
          <p className="text-slate-400">{`Connect your wallet to view your payments`}</p>
        </div>
        <WalletConnect onConnect={onConnect} />
      </div>
    );
  }

  return (
    // Added cursor-default and select-none to the main page wrapper
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in cursor-default select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            {`Transaction History`}
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>{`Account:`}</span>
            {/* Added select-text and cursor-text so the address pill remains functional */}
            <span className="address-pill select-text cursor-text">{shortenAddress(publicKey)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-1">
          {/* Download CSV */}
          <button
            onClick={handleExport}
            disabled={payments.length === 0 || exporting}
            title={
              payments.length === 0
                ? "No transactions to export"
                : `Export ${payments.length} transaction${payments.length !== 1 ? "s" : ""} as CSV`
            }
            className={[
              "inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg",
              "border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar-400/60",
              payments.length === 0 || exporting
                ? "border-white/10 text-slate-600 cursor-not-allowed"
                : "border-stellar-500/30 text-stellar-400 hover:bg-stellar-500/10 hover:border-stellar-500/50 cursor-pointer",
            ].join(" ")}
          >
            {exporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-stellar-400 border-t-transparent rounded-full animate-spin" />
                {`Exporting…`}
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                {`Download CSV`}
              </>
            )}
          </button>

          <Link href="/dashboard" className="btn-secondary text-sm py-2 px-4 cursor-pointer">
            {`← Dashboard`}
          </Link>
        </div>
      </div>

      {/* Export hint */}
      <div className="mb-5 p-3 rounded-xl bg-stellar-500/5 border border-stellar-500/15 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {`Showing your transaction history. Click "Load more" to view older transactions.`}
        </p>
        <a
          href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-stellar-400 hover:text-stellar-300 transition-colors whitespace-nowrap ml-4 cursor-pointer"
        >
          {`Full history →`}
        </a>
      </div>

      {/* Transaction list - Wrapped in select-text so hashes can be copied */}
      <div className="select-text">
        <TransactionList
          publicKey={publicKey}
          limit={20}
          onPaymentsChange={handlePaymentsChange}
          onPrintReceipt={handlePrintReceipt}
        />
      </div>

      <div className="receipt-print-root" aria-hidden="true">
        {receiptPayment && (
          <div className="receipt-sheet card">
            <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-5 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-2">
                  Stellar MicroPay
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Payment Receipt
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {formatDate(receiptPayment.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Network
                </p>
                <p className="text-lg font-semibold text-slate-900">{networkLabel}</p>
                <p className="text-sm text-slate-500 capitalize">
                  {receiptPayment.type === "sent" ? "Sent" : "Received"}
                </p>
              </div>
            </div>

            <dl className="grid gap-4 text-sm text-slate-700">
              <ReceiptRow label="Date" value={formatDate(receiptPayment.createdAt)} />
              <ReceiptRow label="Amount" value={formatXLM(receiptPayment.amount)} />
              <ReceiptRow label="Sender" value={receiptPayment.from} mono />
              <ReceiptRow label="Recipient" value={receiptPayment.to} mono />
              <ReceiptRow label="Memo" value={receiptPayment.memo || "-"} />
              <ReceiptRow label="Transaction Hash" value={receiptPayment.transactionHash} mono />
              <ReceiptRow label="Network" value={networkLabel} />
            </dl>

            <div className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
              Generated by Stellar MicroPay using browser print-to-PDF.
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body.receipt-printing {
            background: #fff !important;
            color: #0f172a !important;
          }

          body.receipt-printing * {
            visibility: hidden !important;
          }

          body.receipt-printing .receipt-print-root,
          body.receipt-printing .receipt-print-root * {
            visibility: visible !important;
          }

          body.receipt-printing .receipt-print-root {
            position: fixed !important;
            inset: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }

          body.receipt-printing .receipt-sheet {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 20mm 18mm;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #fff !important;
            color: #0f172a !important;
          }

          body.receipt-printing .receipt-sheet * {
            color: inherit !important;
          }

          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

function ReceiptRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[1fr_minmax(0,1.8fr)] gap-4 border-b border-slate-200 pb-3">
      <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</dt>
      <dd className={mono ? "font-mono break-all text-slate-900" : "text-slate-900 break-words"}>
        {value}
      </dd>
    </div>
  );
}