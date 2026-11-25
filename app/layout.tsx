import type { Metadata } from "next";
import { Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "KV3 Jhansi | Class XII Farewell Gala & Crown Voting",
  description:
    "Official Class XII Farewell registration, crown voting, and live tally for PM SHRI Kendriya Vidyalaya No. 3, Jhansi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${syne.variable}`}>
      <body className="font-sans antialiased selection:bg-gold-400/30 selection:text-gold-300">
        {children}
      </body>
    </html>
  );
}
