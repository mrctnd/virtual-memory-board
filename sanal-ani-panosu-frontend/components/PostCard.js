'use client';

import { useState } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n';


export default function PostCard({ post, deletable = false, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { t, language } = useI18n();
  // Helper function to ensure proper image URL format
  const getImageUrl = (path) => {
    if (!path) return '/placeholder-image.jpg';
    
    // If it's already an absolute URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // If it's a relative path, convert to absolute URL with the backend base URL
    return `http://localhost:5154/${path}`;
  };
  
  if (!post) return null;

  // Format the creation date
  const formatDate = (dateString) => {
    if (!dateString) return t('posts.unknownDate');
    
    const date = new Date(dateString);
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Handle delete functionality
  const handleDelete = async () => {
    if (!post.id || !onDelete) return;
    
    const confirmed = window.confirm(t('posts.deleteConfirmation'));
    if (!confirmed) return;

    setIsDeleting(true);
    
    try {
      await api.delete(`/posts/${post.id}`);
      
      // Call the callback to refresh the post list
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
            console.error('Error deleting post:', error);
      alert(t('posts.deleteFailed'));
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] group bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 backdrop-blur-xl border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg">
      {/* Enhanced gradient overlay for better visual depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
      
      {/* Delete button - shown only if deletable */}
      {deletable && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white p-2 rounded-full z-20 shadow-xl transition-all duration-300 disabled:opacity-50 opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-red-400/20"
          title={t('posts.deletePost')}
          aria-label={t('posts.deletePost')}
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
      )}{/* Image at the top */}      {(post.imagePath || post.imageUrl) && (        <div 
          className="relative w-full h-56 sm:h-60 md:h-64 lg:h-56 xl:h-60 mb-0 overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 rounded-t-2xl transition-colors duration-300"
        >{imageError ? (            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-full blur-xl"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-center mt-3 font-medium">{t('posts.imageLoadFailed')}</p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setImageError(false);
                  setImageLoading(true);
                }}
                className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs font-medium rounded-full transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transform hover:scale-105"
              >
                {t('posts.retry')}
              </button>
            </div>
          ) : (
            <>              <Image 
                src={getImageUrl(post.imagePath || post.imageUrl)}
                alt={post.title || 'Post image'} 
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
                className="object-cover transition-all duration-500 group-hover:scale-110"
                priority
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
                {/* Enhanced loading overlay */}
              {imageLoading && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-lg"></div>
                      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-3 border border-gray-200/50 dark:border-gray-700/50">
                        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 font-medium">{t('common.loading')}</p>
                  </div>
                </div>
              )}              
              {/* Enhanced gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent group-hover:from-black/50 group-hover:via-black/30 transition-all duration-500"></div>
              
              {/* Shimmer effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-700"></div>
            </>
          )}
        </div>
      )}
        {/* Enhanced Content section */}
      <div className={`p-6 relative z-10 ${(post.imagePath || post.imageUrl) ? 'pt-4' : ''}`}>
        {post.title && (
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{post.title}</h3>
        )}

        {/* Enhanced Note/description */}
        <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 transition-colors duration-200 leading-relaxed">
          {post.content || post.note || t('posts.noDescription')}
        </p>
        
        {/* Enhanced Creation date with better styling */}
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm transition-colors duration-200 font-medium">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-sm"></div>
            <div className="relative bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <span className="ml-3">{formatDate(post.createdAt)}</span>
        </div>
      </div></div>
  );
}