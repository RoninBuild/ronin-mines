import Link from "next/link";
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";

export default function HomePage() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-3xl uppercase tracking-[0.2em]">RONIN MINES</h1>
      <div className="flex w-[min(320px,90%)] flex-col gap-4">
        <Wallet>
          <ConnectWallet className="border-2 border-blue-700 bg-blue-600 px-4 py-2 uppercase tracking-[0.1em] text-white" />
        </Wallet>
        <Link
          className="border-2 border-[#0052ff] bg-[rgba(0,82,255,0.18)] px-4 py-3 text-center uppercase tracking-[0.1em] text-white"
          href="/game"
        >
          Start Game
        </Link>
      </div>
    </section>
  );
}
