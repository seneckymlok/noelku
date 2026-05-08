import type { Metadata } from "next";
import { Anton, Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Self-hosted via next/font — zero render-blocking, no external network request at runtime.
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});
const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});
const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const mono = JetBrains_Mono({
  weight: ["500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://noeliiizi.eu"),
  title: "noeliiizi",
  description:
    "Free drum kit by noeliiizi. 808s, drums, FX and loops — drop your email and grab the stash.",
  keywords: [
    "noeliiizi",
    "free drum kit",
    "free stash kit",
    "trap drum kit",
    "free 808s",
    "drum samples",
    "free beats",
    "beat maker",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: "noeliiizi — Free Stash Kit 01",
    description:
      "Free drum kit by noeliiizi. 808s, drums, FX and loops — drop your email and grab the stash.",
    url: "https://noeliiizi.eu",
    siteName: "noeliiizi",
    images: [
      {
        url: "/background.webp",
        width: 1376,
        height: 768,
        alt: "noeliiizi Free Stash Kit 01",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "noeliiizi — Free Stash Kit 01",
    description:
      "Free drum kit by noeliiizi. 808s, drums, FX and loops — drop your email and grab the stash.",
    images: ["/background.webp"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${bebas.variable} ${inter.variable} ${mono.variable}`}
    >
      <head>
        {/* Preload background images — largest contentful paint assets */}
        <link
          rel="preload"
          as="image"
          href="/background.webp"
          type="image/webp"
          media="(min-width: 641px)"
        />
        <link
          rel="preload"
          as="image"
          href="/mobile_background.webp"
          type="image/webp"
          media="(max-width: 640px)"
        />
        <meta name="theme-color" content="#0c0d08" />
      </head>
      <body>{children}</body>
    </html>
  );
}
