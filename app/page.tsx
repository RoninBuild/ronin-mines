import { WalletDefault } from "@coinbase/onchainkit/wallet";

export default function HomePage() {
  return (
    <section>
      <h1>RONIN MINES</h1>
      <p className="section">
        Welcome to the Base-blue command center. This is the staging area for the
        pixel mining adventure. Navigate to explore the coming game systems and
        prep for launch.
      </p>
      <div className="wallet-center">
        <WalletDefault />
      </div>
      <span className="badge">Prototype UI — Onchain systems coming soon</span>
    </section>
  );
}
