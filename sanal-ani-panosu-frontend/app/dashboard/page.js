'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import BoardCard from '@/components/BoardCard';
import { useI18n } from '@/lib/i18n'; // i18n: added i18n hook import

export default function DashboardPage() {
  const { t } = useI18n(); // i18n: added translation function
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const router = useRouter();

  const fetchBoards = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/boards');
      setBoards(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching boards:', err);
      setError(t('dashboard.errorLoading')); // i18n: fixed translation key
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]); // i18n: added fetchBoards dependency

  const handleBoardClick = (boardId) => {
    router.push(`/boards/${boardId}`);
  };

  const handleDeleteBoard = async (boardId) => {
    try {
      await api.delete(`/boards/${boardId}`);
      // Refresh the boards list
      fetchBoards();
      setDeleteError(null);
    } catch (err) {
      console.error('Error deleting board:', err);
      setDeleteError(t('dashboard.errorDeleting')); // i18n: fixed translation key
      
      // Make sure to refresh the boards list anyway
      fetchBoards();
    }
  };
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Enhanced header section */}
      <div className="relative mb-12">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 rounded-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center p-8">
          <div className="flex-1">
            <div className="mb-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-lg"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-3 border border-gray-200/50 dark:border-gray-700/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2 transition-colors duration-200">{t('dashboard.title')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 transition-colors duration-200">{t('dashboard.subtitle')}</p>
          </div>
          
          <Link 
            href="/boards/new" 
            className="mt-6 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {t('nav.newBoard')}
          </Link>
        </div>
      </div>      {deleteError && (
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl blur-sm"></div>
          <div className="relative bg-red-50/80 dark:bg-red-900/30 backdrop-blur-xl border border-red-200/50 dark:border-red-800/50 text-red-700 dark:text-red-400 p-6 rounded-2xl shadow-lg" role="alert">
            <p className="flex items-center text-lg">
              <div className="relative mr-4">
                <div className="absolute inset-0 bg-red-400/20 rounded-full blur-md"></div>
                <div className="relative bg-red-100 dark:bg-red-800/50 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <span className="font-medium">{deleteError}</span>
            </p>
          </div>
        </div>
      )}{isLoading && (
        <div className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 rounded-3xl blur-sm"></div>
          
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-xl py-24 flex justify-center items-center">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-lg animate-pulse"></div>
                <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 border-r-purple-500"></div>
              </div>
              <p className="text-lg font-medium bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-500 bg-clip-text text-transparent">Loading your boards...</p>
            </div>
          </div>
        </div>
      )}      {error && (
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl blur-sm"></div>
          <div className="relative bg-red-50/80 dark:bg-red-900/30 backdrop-blur-xl border border-red-200/50 dark:border-red-800/50 text-red-700 dark:text-red-400 p-6 rounded-2xl shadow-lg" role="alert">
            <p className="flex items-center text-lg">
              <div className="relative mr-4">
                <div className="absolute inset-0 bg-red-400/20 rounded-full blur-md"></div>
                <div className="relative bg-red-100 dark:bg-red-800/50 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <span className="font-medium">{error}</span>
            </p>
          </div>
        </div>
      )}{!isLoading && !error && boards.length === 0 && (
        <div className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 rounded-3xl blur-sm"></div>
          
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-xl py-20 text-center">
            <div className="mb-8">
              {/* Icon container with gradient background */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-xl"></div>
                <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full p-6 border border-blue-200/50 dark:border-blue-700/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="max-w-md mx-auto mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent mb-4">{t('dashboard.noBoardsTitle')}</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{t('dashboard.noBoardsMessage')}</p>
            </div>
            
            <Link 
              href="/boards/new" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              {t('dashboard.createFirstBoard')}
            </Link>
          </div>
        </div>
      )}{!isLoading && boards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {boards.map((board) => (
            <BoardCard 
              key={board.id}
              board={board} 
              deletable={true} 
              onDelete={handleDeleteBoard}
              onClick={() => handleBoardClick(board.id)}
              isClickable={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
