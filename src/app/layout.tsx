import type { Metadata } from "next";
import { Karla, Cormorant_Garamond } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/layout/AuthProvider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "N H K ARTS - Art Portfolio",
  description: "Explore the exclusive collection of N H K ARTS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${karla.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans relative">
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: '#111',
              color: '#fff',
              border: '1px solid #333',
              borderRadius: '0px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            },
            success: {
              iconTheme: {
                primary: '#d4af37',
                secondary: '#111',
              },
            },
          }} 
        />
        <div className="grain-overlay pointer-events-none fixed inset-0 z-50 opacity-20" />
        <AuthProvider>
          <Navbar />
          <main className="flex-grow pt-20 relative z-10">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
