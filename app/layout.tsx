import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nexus | Gerenciador Inteligente',
  description: 'To-do list unificado Local-First com pilares de Empresa, Pessoal e Saúde.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased min-h-screen selection:bg-indigo-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
