import { getPath } from "@/constants/paths";
import ClientProviders from "@/contexts/ClientProviders";
import "@/styles/global-app.css";
import Script from "next/script";

export const metadata = {
  title: "北斗祭2026アプリ | 富山高専",
  description: "富山高専で行われる北斗祭2026で使えるウェブアプリ",
  icons: {
    icon: getPath("/img/common/favicon.ico"),
    apple: getPath("/img/common/apple-touch-icon.png"),
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f0f5" },
    { media: "(prefers-color-scheme: dark)", color: "#18181a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      {/* <head>
        <Script src="//unpkg.com/react-scan/dist/auto.global.js" crossOrigin="anonymous" strategy="beforeInteractive" />
      </head> */}
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
