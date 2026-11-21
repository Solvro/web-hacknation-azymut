import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Azymut · Ocena okresowa",
  description: "Ocena kompetencji w służbie cywilnej",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
