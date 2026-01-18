import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/game", label: "Game" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/shop", label: "Shop" },
  { href: "/trial", label: "Trial" }
];

export default function Nav() {
  return (
    <nav className="nav">
      {links.map((link) => (
        <Link key={link.href} href={link.href}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
