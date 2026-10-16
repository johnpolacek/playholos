import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, SUSE } from "next/font/google";
import "./globals.css";

const suse = SUSE({ subsets: ["latin"], variable: "--font-suse" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-plex-mono" });

export const metadata: Metadata = {
  title: "Holos",
  description: "Earth wakes as one Mind. You are its Will.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#121314" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${suse.variable} ${plexMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
