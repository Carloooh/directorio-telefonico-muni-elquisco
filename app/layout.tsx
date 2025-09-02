import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/contexts/AuthContext";
import ToasterClient from "@/app/components/ToasterClient";
import Footer from "@/app/components/content/Footer";
import Navbar from "@/app/components/content/Navbar";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Directorio telefónico | Municipalidad El Quisco",
  description: "Directorio telefónico de la Municipalidad El Quisco",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <html
    //   lang="en"
    //   className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    // >
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
          <ToasterClient />
        </AuthProvider>
      </body>
    </html>
  );
}
