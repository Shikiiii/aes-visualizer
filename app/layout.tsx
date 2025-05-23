import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AES 128 Визуализация",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
