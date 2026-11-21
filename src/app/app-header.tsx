import Link from "next/link";
import { Logo } from "./logo";
import { Logout } from "./logout";

export function AppHeader({
  authenticated,
  section,
}: {
  authenticated: boolean;
  section?: string;
}) {
  return (
    <header className="top">
      <Link className="brand" href="/">
        <Logo />
      </Link>
      {section && (
        <nav className="crumbs" aria-label="Okruszki">
          <Link href="/">Start</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{section}</span>
        </nav>
      )}
      <span className="demo">
        {authenticated ? <Logout /> : "Demo przełożonego"}
      </span>
    </header>
  );
}
