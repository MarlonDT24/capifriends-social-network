import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Capifriends - porque la amistad es mejor en manada",
  description: "Red social creada con Next.js + Supabase + Tailwind.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground font-sans`}
      >
        <Navbar />

        {/* CONTENIDO DE CADA PÁGINA */}
        <main className="max-w-6xl mx-auto">{children}</main>

        {/* FOOTER */}
        <footer className="border-t bg-footer-background text-footer-foreground mt-16">
          <div className="max-w-6xl mx-auto p-4 text-sm flex items-center justify-between">
            <p>© {new Date().getFullYear()} Capifriends</p>
            <p>Hecho con Next.js + Supabase</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
