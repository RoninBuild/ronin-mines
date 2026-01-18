import Link from "next/link";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";
import { Avatar, Identity, Name } from "@coinbase/onchainkit/identity";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <section className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 font-mono text-white">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-[0.35em] text-blue-400">
            RONIN MINES
          </h1>
        </header>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-lg shadow-blue-500/20 backdrop-blur">
          {!isConnected ? (
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-2xl font-bold">Welcome, Miner</h2>
              <p className="text-sm text-zinc-400">
                Connect wallet to enter the grid.
              </p>
              <Wallet>
                <ConnectWallet className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-500" />
              </Wallet>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-center">
                <Identity address={address}>
                  <Avatar className="h-14 w-14" />
                  <Name className="text-lg" />
                </Identity>
                <div className="text-xs text-zinc-400">
                  {address ?? "Wallet connected"}
                </div>
              </div>
              <Link
                className="w-full rounded-xl bg-green-600 py-4 text-center text-lg font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-blue-500/20"
                href="/game"
              >
                ENTER GAME
              </Link>
              <button
                className="text-xs text-zinc-400 hover:text-white"
                type="button"
                onClick={() => disconnect()}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
