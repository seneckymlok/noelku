import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOELIIIZI — FREE STASH KIT 01",
  description: "Free drumkit by noeliiizi. Drop your email and grab the stash.",
  openGraph: {
    title: "NOELIIIZI — FREE STASH KIT 01",
    description: "Free drumkit by noeliiizi.",
    images: ["/coverart.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
