import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, SUSE } from "next/font/google";
import "./globals.css";

const suse = SUSE({ subsets: ["latin"], variable: "--font-suse" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-plex-mono" });

const description =
  "In 2040, humanity wakes as one Mind, and you are its Will. Are we alone? Finding other life is our greatest opportunity and gravest threat.";

// What a shared link shows: the title, the line and the card drawn in opengraph-image.tsx. The address makes the
// card's link whole, on previews too.
export const metadata: Metadata = {
  metadataBase: new URL("https://playholos.vercel.app"),
  title: "Holos",
  description,
  openGraph: { type: "website", siteName: "Holos", title: "Holos", description },
  twitter: { card: "summary_large_image", title: "Holos", description },
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
