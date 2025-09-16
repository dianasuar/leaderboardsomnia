import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "RPS Core",
  description: "Retro futurism in digital form",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-green-400 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}