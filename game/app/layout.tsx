import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, SUSE } from "next/font/google";
import "./globals.css";

const suse = SUSE({ subsets: ["latin"], variable: "--font-suse" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-plex-mono" });

export const metadata: Metadata = {
  title: "Holos",
  description: "Earth wakes as one Mind. You are its Will.",
};

// Always dark, and the browser's chrome with it.
export const viewport: Viewport = { themeColor: "#121314", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The about pages' boot script marks <html> before React hydrates it.
    <html lang="en" className={`${suse.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
