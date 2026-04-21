import { getPath } from "@/constants/paths";

export const metadata = {
  title: "北斗祭2026アプリ | 富山高専",
  description: "富山高専で行われる北斗祭2026で使えるウェブアプリ",
  icons: {
    icon: getPath("/favicon.ico"),
    apple: getPath("/apple-touch-icon.png"),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      {/* <head>
        <Script
          src="//unpkg.com/react-scan/dist/auto.global.js"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head> */}
      <body>{children}</body>
    </html>
  );
}
