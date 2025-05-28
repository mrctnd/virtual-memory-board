'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { t } = useI18n();
  const { isAuthenticated, loading } = useAuth();
  
  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [router, isAuthenticated, loading]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-purple-950 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary dark:border-purple-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-950 dark:to-indigo-950 transition-colors duration-300">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-200">
              {t('landing.heroTitle')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-purple-300 mb-8 max-w-3xl mx-auto transition-colors duration-200">
              {t('landing.heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/register" 
                className="btn btn-primary text-lg px-8 py-4 w-full sm:w-auto"
              >
                {t('landing.getStarted')}
              </Link>
              <Link 
                href="/login" 
                className="btn btn-secondary text-lg px-8 py-4 w-full sm:w-auto"
              >
                {t('landing.signIn')}
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-purple-800 rounded-lg p-8 shadow-lg transition-colors duration-200">
              <div className="text-purple-600 dark:text-purple-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-200">
                {t('landing.features.boards.title')}
              </h3>
              <p className="text-gray-600 dark:text-purple-300 transition-colors duration-200">
                {t('landing.features.boards.description')}
              </p>
            </div>

            <div className="bg-white dark:bg-purple-800 rounded-lg p-8 shadow-lg transition-colors duration-200">
              <div className="text-purple-600 dark:text-purple-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-200">
                {t('landing.features.memories.title')}
              </h3>
              <p className="text-gray-600 dark:text-purple-300 transition-colors duration-200">
                {t('landing.features.memories.description')}
              </p>
            </div>

            <div className="bg-white dark:bg-purple-800 rounded-lg p-8 shadow-lg transition-colors duration-200">
              <div className="text-purple-600 dark:text-purple-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-200">
                {t('landing.features.sharing.title')}
              </h3>
              <p className="text-gray-600 dark:text-purple-300 transition-colors duration-200">
                {t('landing.features.sharing.description')}
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-white dark:bg-purple-800 rounded-lg p-12 text-center shadow-lg transition-colors duration-200">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
              {t('landing.cta.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-purple-300 mb-8 transition-colors duration-200">
              {t('landing.cta.subtitle')}
            </p>
            <Link 
              href="/register" 
              className="btn btn-primary text-lg px-12 py-4"
            >
              {t('landing.cta.button')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}