import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Needle25",
  description:
    "Organize your vinyl & music collection, manage a wishlist, and share your personal charts - from current favorites to all-time picks.",
    
  openGraph: {
    title: "Needle25",
    description:
      "Organize your vinyl & music collection and share your personal charts.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Needle25",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
    icons: {
    icon: "/favicon.ico",   
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Needle25',
              url: process.env.NEXT_PUBLIC_APP_URL,
              description:
                'Organize your vinyl & music collection, manage a wishlist, and share your personal charts - from current favorites to all-time picks.',
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
