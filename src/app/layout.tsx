// src/app/layout.tsx
"use client"; // This component must be a client component to use useTranslation()

import { Inter } from "next/font/google";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import I18nProvider from "@/components/I18nProvider";
import { useTranslation } from "react-i18next";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: '--font-noto-sans-arabic',
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { i18n: i18nInstance } = useTranslation();

  const currentLang = i18nInstance.language;
  const currentDir = currentLang === "ar" ? "rtl" : "ltr";
  const fontVariableClass = currentLang === "ar" ? notoSansArabic.variable : inter.variable;

  return (
    // Add suppressHydrationWarning to the <html> tag.
    // This tells React to ignore mismatches in attributes on this specific element
    // during hydration. This is common for attributes derived from client-side state
    // like browser language settings.
    <html lang={currentLang} dir={currentDir} className={fontVariableClass} suppressHydrationWarning>
      <body>
        <I18nProvider>
          <Providers>{children}</Providers>
        </I18nProvider>
      </body>
    </html>
  );
}