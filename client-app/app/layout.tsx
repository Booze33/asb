import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from 'next/font/google'
import "./globals.css";
import { AuthProvider } from "../lib/auth";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: 'SALON OS - Modern Management',
  description: 'A comprehensive salon management system with appointment booking, payments, and customer care',
  generator: 'B00ZE',
}

export const viewport: Viewport = {
  themeColor: '#0D0D0D',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}