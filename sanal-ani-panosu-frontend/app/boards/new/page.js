'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export default function NewBoardPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: false,
    coverImage: null,
    coverImagePreview: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      
      setFormData({
        ...formData,
        coverImage: file,
        coverImagePreview: previewUrl
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = t('boards.titleRequired');
    }
    
    if (!formData.description.trim()) {
      newErrors.description = t('boards.descriptionRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setServerError('');
    
    try {
      let imagePath = null;
      
      // If a cover image was selected, upload it first
      if (formData.coverImage) {
        // Create FormData for file upload
        const fileFormData = new FormData();
        fileFormData.append('file', formData.coverImage);
        
        // Upload the image
        const uploadResponse = await api.post('/file/upload', fileFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        imagePath = uploadResponse.data.filePath;
      }
      
      // Create the board with or without the cover image
      const boardData = {
        title: formData.title,
        description: formData.description,
        isPublic: formData.isPublic,
        coverImage: imagePath
      };
      
      await api.post('/boards', boardData);
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      setServerError(
        error.response?.data?.message || 
        t('boards.createFailed')
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Enhanced header section */}
      <div className="relative mb-12">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 rounded-3xl"></div>
        
        <div className="relative p-8">
          <div className="mb-6">
            <button 
              onClick={() => router.back()} 
              className="inline-flex items-center px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              {t('boards.back')}
            </button>
          </div>
          
          <div className="text-center">
            <div className="mb-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-lg"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-3 border border-gray-200/50 dark:border-gray-700/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-3">{t('boards.createNew')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">{t('boards.createDescription')}</p>
          </div>
        </div>
      </div>
      
      {serverError && (
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
              <span className="font-medium">{serverError}</span>
            </p>
          </div>
        </div>
      )}
        
      {/* Enhanced form card */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 rounded-3xl blur-sm"></div>
        
        <form onSubmit={handleSubmit} className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-xl p-8 space-y-8">
          {/* Title Field */}
          <div className="space-y-3">
            <label htmlFor="title" className="block text-sm font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-500 bg-clip-text text-transparent">
              {t('boards.title')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border rounded-2xl transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-lg font-medium shadow-lg focus:shadow-xl ${
                errors.title 
                  ? 'border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400' 
                  : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
              }`}
              placeholder={t('boards.titlePlaceholder')}
            />
            {errors.title && (
              <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.title}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-3">
            <label htmlFor="description" className="block text-sm font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-500 bg-clip-text text-transparent">
              {t('boards.description')} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border rounded-2xl transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-lg resize-y shadow-lg focus:shadow-xl ${
                errors.description 
                  ? 'border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400' 
                  : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
              }`}
              placeholder={t('boards.descriptionPlaceholder')}
            />
            {errors.description && (
              <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.description}
              </p>
            )}
          </div>

          {/* Public/Private Toggle */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-2xl blur-sm"></div>
            <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200"
                />
                <label htmlFor="isPublic" className="text-lg font-medium text-gray-900 dark:text-gray-100 cursor-pointer select-none">
                  {t('boards.makePublic')}
                </label>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-9">
                Public boards can be viewed by other users
              </p>
            </div>
          </div>
          
          {/* Cover Image Upload */}
          <div className="space-y-4">
            <label htmlFor="coverImage" className="block text-sm font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-500 bg-clip-text text-transparent">
              {t('boards.coverImage')}
            </label>
            <input
              type="file"
              id="coverImage"
              name="coverImage"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="block w-full text-sm text-gray-600 dark:text-gray-400
                file:mr-4 file:py-3 file:px-6
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-gradient-to-r file:from-blue-500 file:to-purple-600
                file:text-white file:shadow-lg
                hover:file:from-blue-600 hover:file:to-purple-700
                file:transition-all file:duration-200
                border border-gray-200/50 dark:border-gray-600/50 rounded-2xl p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm shadow-lg"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('boards.coverImageHint')}
            </p>
            
            {formData.coverImagePreview && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl blur-sm"></div>
                <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-2xl overflow-hidden shadow-xl">
                  <Image 
                    src={formData.coverImagePreview} 
                    alt="Cover preview" 
                    width={600}
                    height={200}
                    className="w-full h-48 object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200/50 dark:border-gray-600/50">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-600/80"
            >
              {t('boards.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-lg inline-flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('boards.creating')}
                </>
              ) : t('boards.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}