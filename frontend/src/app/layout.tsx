
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VetCare / MedPet',
  description: 'Sistema de gestão veterinária com agendamento.',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <script src="https://cdn.tailwindcss.com" async></script>
        <script src="https://unpkg.com/@phosphor-icons/web" async></script>
      </head>
      <body className="text-slate-800 antialiased bg-slate-50">
        {children}
      </body>
    </html>
  );
}
