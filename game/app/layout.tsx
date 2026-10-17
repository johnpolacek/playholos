import type { Metadata } from "next";
import { IBM_Plex_Mono, SUSE } from "next/font/google";
import { themeScript } from "@/lib/theme";
import "./globals.css";

const suse = SUSE({ subsets: ["latin"], variable: "--font-suse" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-plex-mono" });

export const metadata: Metadata = {
  title: "Holos",
  description: "Earth wakes as one Mind. You are its Will.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${suse.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        {/* The theme, and the browser chrome's color to match, before the first paint. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
