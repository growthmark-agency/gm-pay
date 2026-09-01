import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GM Pay — Next-Gen Automated Payment Gateway for Bangladesh",
  description: "Automate bKash, Nagad, Rocket & Upay payments with zero manual delays, smart wallet load balancing and zero hosting costs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
