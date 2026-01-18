import "@coinbase/onchainkit/styles.css";
import type { Metadata } from "next";
import "./globals.css";
import Nav from "./components/Nav";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "RONIN MINES",
  description: "Base-blue pixel mining adventure hub."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main>
            <Nav />
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
