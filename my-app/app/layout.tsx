import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



// app/layout.tsx

import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/layout/Navbar";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Facturación",
  description: "Sistema de gestión de facturas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} flex min-h-screen`}>
        {/* Barra lateral */}
        <Navbar />
        
        {/* Contenido principal */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header />
          
          {/* Contenido de la página */}
          <main className="flex-grow p-6 bg-gray-50">
            {children}
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </body>
    </html>
  );
}