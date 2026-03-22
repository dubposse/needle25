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
      "Organize your vinyl & music collection, manage a wishlist, and share your personal charts - from current favorites to all-time picks.",
    url: "https://needle25.vercel.app/",
    siteName: "Needle25",
    images: [
      {
        url: "https://needle25.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
