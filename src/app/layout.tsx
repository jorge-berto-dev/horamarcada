import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HoraMarcada — agendamento online para qualquer negócio',
  description: 'HoraMarcada: link público de agendamento, confirmação WhatsApp e agenda do celular. Piloto aberto e grátis.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
