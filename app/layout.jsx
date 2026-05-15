import { Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata = {
  title: 'CrewBoard — Team Task Manager',
  description: 'Manage projects, assign tasks, and track progress with role-based access control.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="antialiased bg-gray-950 text-gray-100 min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
