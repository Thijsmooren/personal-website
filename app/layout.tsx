import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thijs Mooren · Abstract systems, practical execution",
  description: "Thijs Mooren works across mathematics, information law, quantum technology, AI and commercial growth.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
