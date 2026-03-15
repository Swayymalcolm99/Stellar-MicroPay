/**
 * pages/_app.tsx
 * Global app wrapper — manages wallet state across all pages.
 */

import type { AppProps } from "next/app";
import { useState, useEffect } from "react";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import { getConnectedPublicKey } from "@/lib/wallet";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const [publicKey, setPublicKey] = useState<string | null>(null);

  // Restore wallet connection on page load
  useEffect(() => {
    getConnectedPublicKey().then((pk) => {
      if (pk) setPublicKey(pk);
    });
  }, []);

  const handleConnect = (pk: string) => setPublicKey(pk);
  const handleDisconnect = () => setPublicKey(null);

  return (
    <>
      <Head>
        <title>Stellar MicroPay</title>
        <meta name="description" content="Cross-border micro-payments on the Stellar blockchain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-cosmos-900 bg-grid">
        <Navbar
          publicKey={publicKey}
          onConnect={() => {}}
          onDisconnect={handleDisconnect}
        />
        <main>
          <Component
            {...pageProps}
            publicKey={publicKey}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        </main>
      </div>
    </>
  );
}
