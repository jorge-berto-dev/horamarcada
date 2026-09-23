import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'HoraMarcada — agendamento online para qualquer negócio',
  description:
    'HoraMarcada: crie sua página, receba agendamentos, confirme no WhatsApp e reduza faltas. Piloto aberto e grátis.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
