import type { Metadata } from "next";
import "./globals.css";
import Nav from "./components/Nav";

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
        <main>
          <Nav />
          {children}
        </main>
      </body>
    </html>
  );
}
