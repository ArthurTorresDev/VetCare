
import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '../context/index';
import { USER_PREFERENCES_STORAGE_KEY } from '../repositories/index';

export const metadata: Metadata = {
  title: 'VetCare',
  description: 'Sistema de gestão veterinária com agendamento.',
  icons: {
    icon: '/favicon.png',
  },
};

const themeInitializationScript = `
  try {
    const savedTheme = localStorage.getItem(${JSON.stringify(USER_PREFERENCES_STORAGE_KEY)});
    document.documentElement.dataset.theme = JSON.parse(savedTheme || 'null') === 'dark' ? 'dark' : 'light';
  } catch {
    document.documentElement.dataset.theme = 'light';
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-theme="light" suppressHydrationWarning>
      <head>
        <Script
          id="theme-initialization"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitializationScript }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script src="https://cdn.tailwindcss.com" async></script>
        <script src="https://unpkg.com/@phosphor-icons/web" async></script>
      </head>

      <body className="text-slate-800 antialiased bg-slate-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
