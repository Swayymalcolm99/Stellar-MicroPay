/**
 * components/Navbar.tsx
 * Top navigation bar with wallet status indicator.
 */

import Link from "next/link";
import { useRouter } from "next/router";
import { shortenAddress } from "@/lib/stellar";
import clsx from "clsx";

interface NavbarProps {
  publicKey: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
];

export default function Navbar({ publicKey, onConnect, onDisconnect }: NavbarProps) {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 border-b border-[rgba(14,165,233,0.12)] bg-cosmos-900/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-stellar-500/20 border border-stellar-500/30 flex items-center justify-center group-hover:border-stellar-500/60 transition-colors">
            <StarIcon className="w-4 h-4 text-stellar-400" />
          </div>
          <span className="font-display font-semibold text-white tracking-tight">
            Stellar<span className="text-stellar-400">MicroPay</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                router.pathname === link.href
                  ? "bg-stellar-500/15 text-stellar-300"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Wallet button */}
        <div className="flex items-center gap-3">
          {publicKey ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 address-pill">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{shortenAddress(publicKey)}</span>
              </div>
              <button
                onClick={onDisconnect}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={onConnect} className="btn-primary text-sm py-2 px-4">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L14.09 8.26L21 9L15.5 14.14L17.18 21L12 17.77L6.82 21L8.5 14.14L3 9L9.91 8.26L12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}
