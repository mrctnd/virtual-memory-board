'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n'; // i18n: added i18n hook import

export default function BoardCard({ board, deletable = false, onDelete, onClick, isClickable = false }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useI18n(); // i18n: added translation function
  
  // Handle case when board might be null or undefined
  if (!board) {
    return null;
  }
    // Format the creation date
  const formatDate = (dateString) => {
    if (!dateString) return t('common.unknownDate'); // i18n: added translation key
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  // Handle delete event to stop propagation
  const handleDelete = (e) => {
    e.stopPropagation(); // Prevents the parent onClick (board click) from firing
    if (onDelete && !isDeleting) {
      const confirmed = window.confirm(t('boards.deleteConfirmation', { title: board.title })); // i18n: added translation key
      if (confirmed) {
        setIsDeleting(true);
        onDelete(board.id);
      }
    }
  };
  // Determine the icon based on board privacy
  const isPrivate = board.isPrivate || false;

  // Handle card click
  const handleCardClick = (e) => {
    // Don't trigger card click if delete button was clicked
    if (isDeleting || e.target.closest('button')) {
      return;
    }
    if (onClick && isClickable) {
      onClick();
    }
  };
  return (
    <div 
      className={`h-full flex flex-col relative overflow-hidden transition-all duration-300 group ${
        isClickable ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.03] bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-blue-900/20' : 'bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50'
      } backdrop-blur-xl border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg`}
      onClick={handleCardClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e);
        }
      } : undefined}
    >
      {/* Enhanced gradient overlay for better visual depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>      {/* Enhanced Delete button */}
      {deletable && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white p-2.5 rounded-full z-20 shadow-xl transition-all duration-300 disabled:opacity-50 opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-red-400/20 hover:scale-110"
          title={t('boards.deleteBoard')} // i18n: added translation key
          aria-label={t('boards.deleteBoard')} // i18n: added translation key
        >
          {isDeleting ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      )}      {/* Enhanced Cover Image with modern styling */}
      {board.coverImage && (
        <div className="mb-0 w-full h-56 sm:h-60 md:h-64 lg:h-56 xl:h-60 overflow-hidden rounded-t-2xl relative group/image">
          <Image 
            src={board.coverImage} 
            alt={`${board.title} cover`} 
            width={500} 
            height={240}
            className="w-full h-full object-cover transition-all duration-500 group-hover/image:scale-110" 
            unoptimized
          />
          {/* Enhanced gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent group-hover/image:from-black/50 group-hover/image:via-black/30 transition-all duration-500" />
            {/* Shimmer effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/image:opacity-100 group-hover/image:animate-pulse transition-opacity duration-700"></div>
        </div>
      )}

      {/* Enhanced content section */}
      <div className={`p-6 flex flex-col flex-grow relative z-10 ${board.coverImage ? 'pt-4' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-2 pr-8 transition-colors duration-200 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400">{board.title}</h3>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-sm"></div>
            <div className="relative bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full p-2">
              {isPrivate ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300 transition-colors duration-200" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300 transition-colors duration-200" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>              )}
            </div>
          </div>
        </div>

        {/* Enhanced description */}
        <p className="text-gray-600 dark:text-gray-300 text-base mb-6 flex-grow line-clamp-3 transition-colors duration-200 leading-relaxed">
          {board.description || t('boards.noDescription')} {/* i18n: added translation key */}
        </p>
        
        {/* Enhanced footer section */}
        <div className="flex flex-col gap-3 text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-200/50 dark:border-gray-700/50 transition-colors duration-200">
          {/* Creator */}
          <span className="flex items-center">
            <div className="relative mr-3">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-sm"></div>
              <div className="relative bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            {t('boards.createdBy')}: <span className="font-medium ml-1 text-gray-700 dark:text-gray-200">{board.createdBy || t('boards.unknown')}</span>
          </span>
          
          <div className="flex items-center justify-between">
            {/* Date */}
            <span className="flex items-center">
              <div className="relative mr-3">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-sm"></div>
                <div className="relative bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full p-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">{formatDate(board.createdAt)}</span>
            </span>
            
            {/* Enhanced Post count */}
            <span className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/20 px-3 py-2 rounded-full border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
              <div className="relative mr-2">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-indigo-400/30 rounded-full blur-sm"></div>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
              </div>
              <span className="font-bold text-blue-700 dark:text-blue-300">{board.postCount || 0}</span>
              <span className="ml-1 text-xs text-blue-600 dark:text-blue-400 font-medium">{t('boards.posts')}</span> {/* i18n: added translation key */}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}