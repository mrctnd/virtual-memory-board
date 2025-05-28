'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import BoardCard from '@/components/BoardCard';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n'; // i18n: added i18n hook import

export default function ExplorePage() {
  const router = useRouter();
  const { t } = useI18n(); // i18n: added translation function
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const token = document.cookie.includes('jwt=');
      setIsAuthenticated(!!token);
    };

    checkAuth();
      const fetchPublicBoards = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.get('/boards/public');
        setBoards(response.data);      } catch (err) {
        console.error('Error fetching public boards:', err);
        setError(t('explore.errorLoading')); // i18n: fixed translation key
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPublicBoards();
  }, [t]); // i18n: added t dependency

  const handleBoardClick = (boardId) => {
    router.push(`/boards/${boardId}`);
  };  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-purple-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6 transition-colors duration-200" role="alert">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>        <button 
          onClick={() => window.location.reload()}
          className="text-primary dark:text-purple-300 hover:text-primary-dark dark:hover:text-purple-200 flex items-center transition-colors duration-200"
        ><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          {t('common.tryAgain')} {/* i18n: added translation key */}
        </button>
      </div>
    );
  }

  return (    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Enhanced Page header with gradient background */}
      <div className="relative mb-12">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-3xl"></div>
        
        <div className="relative text-center py-12 px-8">
          <div className="mb-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-2xl"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-6 border border-gray-200/50 dark:border-gray-700/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9 9m0 0l5.196-5.196a1.5 1.5 0 012.121 0l5.196 5.196a1.5 1.5 0 010 2.121L16 16.5a1.5 1.5 0 01-2.121 0L8.683 11.304a1.5 1.5 0 010-2.121z" />
                </svg>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-4 transition-colors duration-200">{t('explore.title')}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-200 leading-relaxed">{t('explore.subtitle')}</p>
          
          {!isAuthenticated && (
            <div className="mt-8">
              <p className="mb-4 text-gray-600 dark:text-gray-300 transition-colors duration-200">{t('explore.joinCommunity')}</p>
              <div className="flex justify-center gap-4">
                <Link href="/login" className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                  {t('nav.login')}
                </Link>
                <Link href="/register" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  {t('explore.createAccount')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>      {/* Enhanced Boards grid */}
      {boards.length === 0 ? (
        <div className="relative py-20">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/30 rounded-3xl"></div>
          
          <div className="relative text-center">
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-blue-400/20 rounded-full blur-2xl"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-8 border border-gray-200/50 dark:border-gray-700/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 transition-colors duration-200">{t('explore.noPublicBoards')}</h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 transition-colors duration-200 max-w-md mx-auto">{t('explore.checkBackLater')}</p>
          </div>
        </div>) : (        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {boards.map(board => (
            <BoardCard 
              key={board.id} 
              board={board} 
              onClick={() => handleBoardClick(board.id)}
              isClickable={true}
            />
          ))}
        </div>
      )}

      {/* Action links */}      <div className="mt-10 text-center">
        {isAuthenticated ? (          <Link
            href="/dashboard"
            className="text-primary dark:text-purple-300 hover:text-primary-dark dark:hover:text-purple-200 font-medium inline-flex items-center transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            {t('explore.backToDashboard')} {/* i18n: added translation key */}
          </Link>
        ) : (
          <p className="text-text-secondary dark:text-purple-300 transition-colors duration-200">
            {t('explore.exploreMoreContent')}{' '} {/* i18n: added translation key */}            <Link href="/login" className="text-primary dark:text-purple-300 hover:text-primary-dark dark:hover:text-purple-200 font-medium transition-colors duration-200">
              {t('explore.signingIn')} {/* i18n: added translation key */}
            </Link>
            {' '}{t('common.or')}{' '} {/* i18n: added translation key */}
            <Link href="/register" className="text-primary dark:text-purple-300 hover:text-primary-dark dark:hover:text-purple-200 font-medium transition-colors duration-200">
              {t('explore.creatingAccount')} {/* i18n: added translation key */}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
