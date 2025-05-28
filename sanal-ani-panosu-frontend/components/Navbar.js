'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { t, locale, changeLanguage, languages } = useI18n();
  const { isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const languageDropdownRef = useRef(null);
  // Click-outside handler for language dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setIsLanguageMenuOpen(false);
      }
    };

    if (isLanguageMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageMenuOpen]);
  const handleLogout = () => {
    // Use the logout function from AuthContext
    logout();
    
    // Also call the logout utility function for cleanup
    logoutUser(router);
  };return (    <nav className="bg-white dark:bg-purple-800 shadow-sm dark:shadow-purple-800/30 py-3 px-4 transition-colors duration-300 border-b border-purple-100 dark:border-purple-900">
      <div className="container mx-auto flex justify-between items-center">{/* Logo and brand */}
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="text-xl font-semibold text-primary dark:text-purple-300 transition-colors duration-200 hover:text-primary-dark dark:hover:text-purple-200">
          {t('nav.brand')} {/* i18n: added translation key */}
        </Link>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-text-primary dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-purple-500 rounded-md p-1 transition-colors duration-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            ) : (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            )}
          </svg>
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Theme toggle button */}
          <button
            onClick={toggleTheme}
            className="btn-icon text-text-secondary dark:text-purple-200 hover:text-primary dark:hover:text-purple-300 
            hover:bg-purple-50 dark:hover:bg-purple-900 focus:ring-primary dark:focus:ring-purple-500"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              // Moon icon for dark mode
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              // Sun icon for light mode
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {/* Language selector */}
          <div className="relative" ref={languageDropdownRef}> {/* i18n: language dropdown */}
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="btn-icon text-text-secondary dark:text-purple-200 hover:text-primary dark:hover:text-purple-300 
              hover:bg-purple-50 dark:hover:bg-purple-800 focus:ring-primary dark:focus:ring-purple-500 px-3 py-1 text-sm font-medium"
              aria-label="Change language"
            >
              {locale.toUpperCase()}
            </button>            {isLanguageMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-purple-950 rounded-md shadow-lg border border-purple-200 dark:border-purple-900 z-50">
                {Object.entries(languages).map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => {
                      changeLanguage(code);
                      setIsLanguageMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors duration-200 ${
                      code === locale 
                        ? 'bg-purple-50 dark:bg-purple-900 text-primary dark:text-purple-300' 
                        : 'text-text-secondary dark:text-purple-100'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}          </div>

          {isAuthenticated ? (
            <>
              <Link 
                href="/explore" 
                className="text-text-secondary dark:text-purple-300 hover:text-primary dark:hover:text-purple-200 font-medium transition-colors duration-200"
              >
                {t('nav.explore')} {/* i18n: added translation key */}
              </Link>
              <Link 
                href="/dashboard"
                className="text-text-secondary dark:text-purple-300 hover:text-primary dark:hover:text-purple-200 font-medium transition-colors duration-200"
              >
                {t('nav.dashboard')} {/* i18n: added translation key */}
              </Link>
              <Link 
                href="/profile" 
                className="text-text-secondary dark:text-purple-300 hover:text-primary dark:hover:text-purple-200 font-medium transition-colors duration-200"
              >
                {t('nav.profile')} {/* i18n: added translation key */}
              </Link>
              <Link 
                href="/boards/new" 
                className="text-text-secondary dark:text-purple-300 hover:text-primary dark:hover:text-purple-200 font-medium transition-colors duration-200"
              >
                {t('nav.newBoard')} {/* i18n: added translation key */}
              </Link>              <button 
                onClick={handleLogout}
                className="btn-icon text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300 transition-colors duration-200 flex items-center space-x-1" 
                title={t('nav.logout')}
              >
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>{t('nav.logout')}</span>
              </button>
            </>
          ) : (
            <>              <Link 
                href="/login" 
                className="btn-icon text-primary dark:text-purple-300 hover:text-primary-dark dark:hover:text-purple-200 transition-colors duration-200 flex items-center space-x-1"
                title={t('nav.login')}
              >
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>{t('nav.login')}</span>
              </Link>
              <Link 
                href="/register" 
                className="btn btn-primary flex items-center space-x-1"
              >
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>{t('nav.signup')}</span>
              </Link>
            </>
          )}
        </div>
      </div>      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 py-2 bg-background dark:bg-purple-800 rounded-md shadow-md dark:shadow-purple-800/20 border border-gray-200 dark:border-purple-900 transition-colors duration-300">
          {/* Theme toggle button for mobile */}
          <button
            onClick={toggleTheme}
            className="flex items-center w-full px-4 py-2 text-text-secondary dark:text-purple-300 hover:bg-gray-100 dark:hover:bg-purple-900 hover:text-primary dark:hover:text-purple-200 transition-colors duration-200"
          >
            {theme === 'light' ? (
              <>
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                {t('nav.darkMode')} {/* i18n: added translation key */}
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {t('nav.lightMode')} {/* i18n: added translation key */}
              </>
            )}
          </button>

          {/* Language selector for mobile */}
          <div className="px-4 py-2"> {/* i18n: mobile language selector */}
            <p className="text-xs text-text-secondary dark:text-gray-400 mb-2">Language / Dil</p>
            <div className="flex space-x-2">
              {Object.entries(languages).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => changeLanguage(code)}                  className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
                    code === locale 
                      ? 'bg-primary dark:bg-purple-600 text-white' 
                      : 'bg-gray-200 dark:bg-purple-900 text-text-secondary dark:text-purple-300 hover:bg-gray-300 dark:hover:bg-purple-800'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>          {/* Common links for all users */}

          {isAuthenticated ? (
            <>
              <Link 
                href="/explore" 
                className="block px-4 py-2 text-text-secondary dark:text-purple-300 hover:bg-gray-100 dark:hover:bg-purple-900 hover:text-primary dark:hover:text-purple-200 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.explore')} {/* i18n: added translation key */}
              </Link>
              <Link 
                href="/dashboard" 
                className="block px-4 py-2 text-text-secondary dark:text-purple-300 hover:bg-gray-100 dark:hover:bg-purple-900 hover:text-primary dark:hover:text-purple-200 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.dashboard')} {/* i18n: added translation key */}
              </Link>
              <Link 
                href="/profile" 
                className="block px-4 py-2 text-text-secondary dark:text-purple-300 hover:bg-gray-100 dark:hover:bg-purple-900 hover:text-primary dark:hover:text-purple-200 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.profile')} {/* i18n: added translation key */}
              </Link>

              <Link 
                href="/boards/new"
                className="block px-4 py-2 text-text-secondary dark:text-purple-300 hover:bg-gray-100 dark:hover:bg-purple-900 hover:text-primary dark:hover:text-purple-200 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.newBoard')} {/* i18n: added translation key */}
              </Link>              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-purple-900 transition-colors duration-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('nav.logout')} {/* i18n: added translation key */}
              </button>
            </>
          ) : (
            <>              <Link 
                href="/login" 
                className="flex px-4 py-2 text-text-secondary dark:text-purple-300 hover:bg-gray-100 dark:hover:bg-purple-900 hover:text-primary dark:hover:text-purple-200 transition-colors duration-200 items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {t('nav.login')} {/* i18n: added translation key */}
              </Link>              <Link 
                href="/register" 
                className="flex px-4 py-2 text-text-secondary dark:text-purple-300 hover:bg-gray-100 dark:hover:bg-purple-900 hover:text-primary dark:hover:text-purple-200 transition-colors duration-200 items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                {t('nav.signup')} {/* i18n: added translation key */}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
