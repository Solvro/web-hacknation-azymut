import Link from "next/link";
import { Compass } from "lucide-react";
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
        <Compass aria-hidden="true" size={30} /> Azymut
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
