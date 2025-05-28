/*
 * DARK MODE UPDATE: Added theme provider and dark mode support
 * - Wrapped app in ThemeProvider for global theme management
 * - Updated body classes to support dark mode transitions
 * - Added dark mode variants for background, text, and footer
 * - Maintained all existing layout structure and functionality
 */

/*
 * Layout Component
 * - Modern, clean UI with consistent spacing
 * - Uses sticky navigation and responsive container
 * - Properly structures page with header, main content, and footer
 */
import './globals.css';
import Navbar from '@/components/Navbar';
import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/contexts/AuthContext';// i18n: added i18n provider import

export const metadata = {
  title: 'Muru',
  description: 'A digital space for your memories and notes',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-background dark:bg-purple-950 text-text-primary dark:text-purple-100 transition-colors duration-300 flex flex-col">
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              {/* Navbar fixed at the top */}
              <header className="sticky top-0 z-50 bg-white dark:bg-purple-800 shadow-sm transition-colors duration-300">
                <Navbar />
              </header>
              
              {/* Main content with proper spacing from navbar */}
              <main className="flex-grow py-6 px-4 md:px-0">
                {children}
              </main>
                
              {/* Footer */}
              <footer className="bg-white dark:bg-purple-800 py-6 border-t border-gray-200 dark:border-purple-900 transition-colors duration-300">
                <div className="container mx-auto px-4">
                  <p className="text-center text-text-secondary dark:text-purple-300 text-sm transition-colors duration-300">
                    © {new Date().getFullYear()} Muru. All rights reserved.
                  </p>
                </div>
              </footer>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}