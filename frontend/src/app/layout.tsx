import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from 'react-hot-toast'; // Importar Toaster

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GameDev Knowledge Graph",
  description: "Visualizando conexões no mundo dev de games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          {/* Container onde os toasts serão renderizados */}
          <Toaster position="bottom-right" reverseOrder={false} />
        </AuthProvider>
      </body>
    </html>
  );
}