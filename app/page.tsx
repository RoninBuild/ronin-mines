import Link from "next/link";
import { useAccount } from "wagmi";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect
} from "@coinbase/onchainkit/wallet";
import { Avatar, Identity, Name } from "@coinbase/onchainkit/identity";

export default function HomePage() {
  const { address, isConnected } = useAccount();

  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-8 bg-black text-center">
      <h1 className="text-4xl uppercase tracking-[0.3em] text-[#0052ff]">
        RONIN MINES
      </h1>

      {!isConnected ? (
        <Wallet>
          <ConnectWallet className="rounded bg-blue-600 px-5 py-3 text-white" />
        </Wallet>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3 rounded border border-blue-700 bg-[#0b0f1a] px-6 py-4">
            <Identity address={address}>
              <Avatar className="h-14 w-14" />
              <Name className="text-lg text-white" />
            </Identity>
            <Wallet>
              <WalletDropdown>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
          <Link
            className="rounded border-2 border-[#0052ff] bg-[rgba(0,82,255,0.25)] px-8 py-4 text-lg uppercase tracking-[0.2em] text-white"
            href="/game"
          >
            START GAME
          </Link>
        </div>
      )}
    </section>
  );
}
