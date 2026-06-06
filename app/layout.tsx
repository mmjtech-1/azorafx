import type { Metadata } from "next";
import { Toaster } from "sonner";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://fx.azoraglobal.com"),
  title: {
    default: "Azora FX - Professional Trading Journal & Analytics",
    template: "%s | Azora FX",
  },
  description:
    "Track trades, analyze performance, get AI-powered trade reviews, and monitor prop firm challenges. The most advanced trading platform for forex and crypto traders.",
  openGraph: {
    title: "Azora FX - Professional Trading Journal & Analytics",
    description:
      "Track trades, analyze performance, get AI-powered trade reviews, and monitor prop firm challenges.",
    url: "https://fx.azoraglobal.com",
    siteName: "Azora FX",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Azora FX trading dashboard" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Azora FX - Professional Trading Journal & Analytics",
    description: "Professional trading journal, analytics, AI reviews, and prop firm tracking.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        {/* Google Analytics tag placeholder: add the GA script/component here when the measurement ID is ready. */}
        {children}
        <WhatsAppButton />
        <Toaster
          theme="dark"
          richColors
          toastOptions={{
            style: {
              background: "#0E1117",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#F1F5F9",
            },
          }}
        />
      </body>
    </html>
  );
}
