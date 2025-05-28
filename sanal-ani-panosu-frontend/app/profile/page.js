'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import ProfileSettings from '@/components/ProfileSettings';

export default function ProfilePage() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Image upload state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);  // Helper function to validate image URL - moved to top
  const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    return trimmed !== '' && (
      trimmed.startsWith('http://') || 
      trimmed.startsWith('https://') || 
      trimmed.startsWith('blob:') || 
      trimmed.startsWith('/') ||
      trimmed.startsWith('Uploads/') // Handle relative server paths
    );
  };

  // Helper function to get proper image URL for Next.js Image component
  const getImageUrl = (url) => {
    if (!isValidImageUrl(url)) {
      return '/default-avatar.png'; // fallback image
    }
    
    // For blob URLs and absolute URLs, return as-is
    if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // For relative server paths, construct full URL
    if (url.startsWith('Uploads/') || url.startsWith('/uploads/')) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5154';
      return `${API_URL}/uploads/${url.replace(/^(Uploads\/|\/uploads\/)/, '')}`;
    }
    
    // For other relative paths
    if (url.startsWith('/')) {
      return url;
    }
    
    return '/default-avatar.png'; // fallback
  };useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);        const response = await api.get('/user/me');
        
        // Add fullName to user data for easier access
        const userData = {
          ...response.data,
          fullName: response.data.firstName && response.data.lastName 
            ? `${response.data.firstName} ${response.data.lastName}`.trim()
            : response.data.firstName || response.data.lastName || null
        };
        
        setUser(userData);
        setError(null);// If user has a profile image, validate and set it as the preview
        if (response.data.profileImageUrl && isValidImageUrl(response.data.profileImageUrl)) {          // Handle relative URLs by prepending the API base URL
          const fullImageUrl = response.data.profileImageUrl.startsWith('http') || response.data.profileImageUrl.startsWith('blob:')
            ? response.data.profileImageUrl 
            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5154'}/uploads/${response.data.profileImageUrl.replace(/^Uploads\//, '')}`;
          
          setImagePreview(fullImageUrl);
          console.log('Profile image URL:', fullImageUrl);
        } else if (response.data.profileImageUrl) {
          console.warn('Invalid profile image URL:', response.data.profileImageUrl);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(t('profile.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [t]);

  // Separate useEffect for cleanup
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError(t('profile.invalidFileType'));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(t('profile.fileTooLarge'));
        return;
      }
        setSelectedImage(file);
      
      // Create blob URL for preview with error handling
      try {
        const blobUrl = URL.createObjectURL(file);
        setImagePreview(blobUrl);
        console.log('Created blob URL for preview:', blobUrl);
      } catch (error) {
        console.error('Error creating blob URL:', error);
        setUploadError('Failed to create image preview');
        return;
      }
      
      setUploadSuccess(false);
      setUploadError(null);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      setUploadError(t('profile.pleaseSelectImage'));
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      
      const formData = new FormData();
      formData.append('file', selectedImage);
      
      // Use explicit timeout to prevent hanging requests
      const response = await api.post('/user/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 seconds timeout
      });      console.log('Upload response:', response.data);
      
      // Try different possible field names for the profile image URL
      const profileImageUrl = response.data.profileImage || 
                             response.data.profileImageUrl || 
                             response.data.imageUrl || 
                             response.data.url ||
                             response.data.filePath;
      
      console.log('Extracted profile image URL:', profileImageUrl);
      console.log('Profile image URL type:', typeof profileImageUrl);
      console.log('Profile image URL starts with:', {
        http: profileImageUrl?.startsWith('http'),
        blob: profileImageUrl?.startsWith('blob:'),
        uploads: profileImageUrl?.startsWith('Uploads/')
      });
        if (profileImageUrl && isValidImageUrl(profileImageUrl)) {        // Handle relative URLs by prepending the API base URL
        const fullImageUrl = profileImageUrl.startsWith('http') || profileImageUrl.startsWith('blob:') 
          ? profileImageUrl 
          : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5154'}/uploads/${profileImageUrl.replace(/^Uploads\//, '')}`;
        
        console.log('Full image URL:', fullImageUrl);
        
        // Update the user object with the new profile image URL
        setUser({
          ...user,
          profileImageUrl: fullImageUrl
        });
        
        // Clean up the blob URL if it exists
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }
        
        // Update the image preview with the server path
        setImagePreview(fullImageUrl);
        
        setUploadSuccess(true);
        setSelectedImage(null);
      } else {
        console.error('Server response does not contain a valid profile image URL:', response.data);
        throw new Error(`Upload succeeded but no valid image URL received. Server response: ${JSON.stringify(response.data)}`);
      }    } catch (err) {
      console.error('Error uploading profile image:', err);
      console.error('Full error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Provide more specific error messages
      if (err.response?.status === 413) {
        setUploadError('File too large. Please choose a smaller image.');
      } else if (err.response?.status === 415) {
        setUploadError('Invalid file type. Please choose a valid image file.');
      } else if (err.response?.status === 401) {
        setUploadError('Authentication failed. Please log in again.');
      } else if (err.message.includes('Upload succeeded but no valid image URL')) {
        setUploadError('Upload completed but server response was unexpected. Please try again.');
      } else {
        setUploadError(err.response?.data?.message || err.message || t('profile.failedToUploadImage'));
      }
    } finally {
      setUploading(false);
    }
  };  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 rounded-3xl blur-sm"></div>
          
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-xl py-24 flex justify-center items-center">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-lg animate-pulse"></div>
                <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 border-r-purple-500"></div>
              </div>
              <p className="text-lg font-medium bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-500 bg-clip-text text-transparent">{t('profile.loading')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2 transition-colors duration-200">{t('profile.title')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 transition-colors duration-200">{t('profile.description')}</p>
          </div>
          
          <button
            onClick={() => setShowSettings(true)}
            className="mt-6 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center"
            title={t('profile.settings')}
          >
            <svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t('profile.settings')}
          </button>
        </div>
      </div>      
      {/* Enhanced profile card */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 rounded-3xl blur-sm"></div>
        
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-xl p-8">
          <div className="flex flex-col lg:flex-row lg:gap-12">
            {/* Profile Image Section */}
            <div className="w-full lg:w-1/3 mb-8 lg:mb-0">
              <div className="flex flex-col items-center">
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-xl scale-110"></div>                    <div className="relative w-48 h-48 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-4 border-white dark:border-gray-600 shadow-2xl">                    {isValidImageUrl(imagePreview) ? (
                      // Use Next.js Image component with proper configuration for all image sources
                      <Image
                        src={getImageUrl(imagePreview)}
                        alt="Profile"
                        width={192}
                        height={192}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image load error:', e);
                          console.error('Failed image URL:', imagePreview);
                          console.error('Image error details:', {
                            src: e.target?.src,
                            error: e.type,
                            naturalWidth: e.target?.naturalWidth,
                            naturalHeight: e.target?.naturalHeight
                          });
                          // Fallback to no image state if loading fails
                          setImagePreview(null);
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', imagePreview);
                        }}
                        unoptimized={imagePreview?.startsWith('blob:') || imagePreview?.includes('/uploads/')}
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <p className="text-sm text-gray-500 dark:text-gray-400">No image</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Upload form */}
                <form onSubmit={handleImageUpload} className="mt-6 w-full max-w-sm">
                  <div className="mb-4">
                    <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.uploadNewImage')}
                    </label>
                    <div className="relative">
                      <input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="imageUpload"
                        className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer bg-gray-50/50 dark:bg-gray-700/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                      >
                        <div className="text-center">
                          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-sm text-gray-600 dark:text-gray-300">{t('profile.chooseFile')}</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {selectedImage && (
                    <button
                      type="submit"
                      disabled={uploading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          {t('profile.uploading')}
                        </div>
                      ) : (
                        t('profile.uploadImage')
                      )}
                    </button>
                  )}
                  
                  {/* Upload feedback */}
                  {uploadError && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
                      {uploadError}
                    </div>
                  )}
                  
                  {uploadSuccess && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg text-sm">
                      {t('profile.imageUploadSuccess')}
                    </div>
                  )}
                </form>
              </div>
            </div>
            
            {/* User Info Section */}
            <div className="w-full lg:w-2/3">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.username')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl"></div>
                      <div className="relative bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl px-4 py-3">
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{user?.username}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.email')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl"></div>
                      <div className="relative bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl px-4 py-3">
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('profile.fullName')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl"></div>
                    <div className="relative bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl px-4 py-3">
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{user?.fullName || t('profile.na')}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('profile.memberSince')}
                  </label>                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl"></div>
                    <div className="relative bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl px-4 py-3">                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {(user?.createdAt || user?.CreatedAt) ? 
                          new Date(user.createdAt || user.CreatedAt).toLocaleDateString('tr-TR') : 
                          t('profile.unknown')
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl blur-sm"></div>
                    <div className="relative bg-white/80 dark:bg-gray-700/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{user?.boardsCount || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t('profile.totalBoards')}</div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl blur-sm"></div>
                    <div className="relative bg-white/80 dark:bg-gray-700/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{user?.postsCount || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t('profile.totalPosts')}</div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl blur-sm"></div>
                    <div className="relative bg-white/80 dark:bg-gray-700/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{user?.commentsCount || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t('profile.totalComments')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <ProfileSettings
          user={user}
          onUpdate={handleUserUpdate}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}