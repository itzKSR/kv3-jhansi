import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "PM SHRI KV No. 3 Jhansi | Class XII Farewell Gala",
  description:
    "Official Class XII Farewell RSVP, KV Crown Ballot, and Live Tally for PM SHRI Kendriya Vidyalaya No. 3, Jhansi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body className="bg-ivory font-sans text-navy antialiased selection:bg-saffron/20 selection:text-navy">
        {children}
      </body>
    </html>
  );
}
