import Link from "next/link";
import { useAccount, useDisconnect } from "wagmi";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect
} from "@coinbase/onchainkit/wallet";
import { Avatar, Identity, Name } from "@coinbase/onchainkit/identity";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <section className="min-h-screen bg-zinc-950 px-6 pb-16 font-mono text-white">
      <header className="flex items-center justify-between py-6">
        <h1 className="text-xl font-bold tracking-[0.3em] text-blue-400">
          RONIN MINES
        </h1>
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <Wallet>
              <ConnectWallet className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500" />
            </Wallet>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 shadow-lg shadow-blue-500/20">
              <Identity address={address}>
                <Avatar className="h-8 w-8" />
                <Name className="text-sm" />
              </Identity>
              <Wallet>
                <WalletDropdown>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          )}
        </div>
      </header>

      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-8 text-center">
        <div className="flex w-full max-w-xl flex-col gap-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-lg shadow-blue-500/20 backdrop-blur">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-bold text-blue-400">WELCOME, MINER</h2>
            <p className="text-sm text-zinc-400">
              Connect your wallet to access the grid and begin the descent.
            </p>
          </div>

          {!isConnected ? (
            <Wallet>
              <ConnectWallet className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-500" />
            </Wallet>
          ) : (
            <Link
              className="w-full rounded-xl bg-green-600 py-4 text-center text-lg font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-blue-500/20"
              href="/game"
            >
              ENTER GAME
            </Link>
          )}

          {isConnected ? (
            <button
              className="text-xs text-zinc-400 hover:text-white"
              type="button"
              onClick={() => disconnect()}
            >
              Disconnect
            </button>
          ) : null}
        </div>
      </main>
    </section>
  );
}
