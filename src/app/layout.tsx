import type { Metadata } from "next";
import { Geist, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/StoreProvider";
import { AppShell } from "@/components/AppShell";

const geist = Geist({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-geist",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BeeBlack | Deriye İşlenmiş Miras, Geleceğe Taşınan Stil",
  description:
    "BeeBlack %100 Hakiki Deri El Çantası, Cüzdan, Mekanizmalı Kartlık ve Kişiye Özel Sıcak Baskı & Hediye Paketi Seçenekleri.",
  icons: {
    icon: "/logo/beeblack-ari.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geist.variable} ${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-screen bg-[#F6F6F6] font-sans text-[#171717] antialiased">
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
