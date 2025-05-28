'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import PostCard from '@/components/PostCard';
import CommentForm from '@/components/CommentForm';
import { useI18n } from '@/lib/i18n'; // i18n: added translation context

export default function BoardDetailPage({ params }) {
  const router = useRouter();
  const { t, locale } = useI18n(); // i18n: added translation function and locale
  const [boardId, setBoardId] = useState(null);
  
  const [board, setBoard] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [newPostVisible, setNewPostVisible] = useState(false);  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editBoardData, setEditBoardData] = useState({
    title: '',
    description: '',
    isPublic: false,
    coverImage: null,
    coverImagePreview: null
  });
  const [newPost, setNewPost] = useState({
    note: '',
    imageFile: null,
    imagePath: '',
    previewUrl: ''
  });  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');  const [deletingComment, setDeletingComment] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);

  // Extract boardId from params
  useEffect(() => {
    const extractParams = async () => {
      const resolvedParams = await params;
      setBoardId(resolvedParams.id);
    };
    extractParams();
  }, [params]);

  useEffect(() => {
    const fetchBoardData = async () => {
      if (!boardId) return; // Don't fetch if boardId is not available yet
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch board data
        const boardResponse = await api.get(`/boards/${boardId}`);
        setBoard(boardResponse.data);
        
        // Check if current user is the owner
        const currentUserId = localStorage.getItem('userId');
        setIsOwner(currentUserId === boardResponse.data.userId);
        
        // Fetch posts for this board
        const postsResponse = await api.get(`/posts/board/${boardId}`);
        setPosts(postsResponse.data);
        
        // Fetch comments for this board
        const commentsResponse = await api.get(`/comments/board/${boardId}`);
        setComments(commentsResponse.data);
          } catch (err) {
        console.error('Error fetching board data:', err);
        setError(t('boards.errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };      fetchBoardData();
  }, [boardId, t]);

  // Initialize edit form data when board is loaded
  useEffect(() => {
    if (board && !isEditMode) {
      setEditBoardData({
        title: board.title,
        description: board.description,
        isPublic: board.isPublic,
        coverImage: null,
        coverImagePreview: board.coverImage
      });
    }
  }, [board, isEditMode]);

  const handleEditBoardChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditBoardData({
      ...editBoardData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEditCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditBoardData({
        ...editBoardData,
        coverImage: file,
        coverImagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleEditBoardSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      let coverImagePath = editBoardData.coverImagePreview;

      // Upload new cover image if selected
      if (editBoardData.coverImage) {
        const formData = new FormData();
        formData.append('file', editBoardData.coverImage);
        
        const uploadResponse = await api.post('/file/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        coverImagePath = uploadResponse.data.filePath;
      }

      // Update board
      await api.put(`/boards/${boardId}`, {
        title: editBoardData.title,
        description: editBoardData.description,
        isPublic: editBoardData.isPublic,
        coverImage: coverImagePath
      });

      // Refresh board data
      const boardResponse = await api.get(`/boards/${boardId}`);
      setBoard(boardResponse.data);
      
      // Exit edit mode
      setIsEditMode(false);
        } catch (err) {
      console.error('Error updating board:', err);
      setSubmitError(err.response?.data?.message || t('boards.errorUpdating'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewPostChange = (e) => {
    const { name, value } = e.target;
    setNewPost({
      ...newPost,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store the file for upload
      setNewPost({
        ...newPost,
        imageFile: file,
        // Create a preview URL for display
        previewUrl: URL.createObjectURL(file)
      });
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {      // Check if image file is selected
      if (!newPost.imageFile) {
        setSubmitError(t('boards.selectImageFile'));
        return;
      }

      // First, upload the image using FormData
      const formData = new FormData();
      formData.append('file', newPost.imageFile);
      
      const uploadResponse = await api.post('/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Extract image path from response
      console.log('File upload response:', uploadResponse.data);
      const imagePath = uploadResponse.data.filePath;
        if (!imagePath) {
        console.error('Invalid image path received from server:', uploadResponse.data);
        setSubmitError(t('boards.errorProcessingImage'));
        setIsSubmitting(false);
        return;
      }
      
      // Send second request to create the post
      const postResponse = await api.post('/posts', {
        boardId,
        note: newPost.note,
        imagePath
      });
      
      // Reset the form
      setNewPost({
        note: '',
        imageFile: null,
        imagePath: '',
        previewUrl: ''
      });
      
      // Hide the form
      setNewPostVisible(false);
      
      // Refresh the posts list by refetching
      const postsResponse = await api.get(`/posts/board/${boardId}`);
      setPosts(postsResponse.data);
        } catch (err) {
      console.error('Error creating post:', err);
      setSubmitError(err.response?.data?.message || t('boards.failedToCreatePost'));
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCommentSubmit = async (data) => {
    try {
      // data already contains the response from the API call
      if (data.response) {
        // Add the new comment to the comments array immediately
        setComments(prevComments => [...prevComments, data.response]);
      }
    } catch (err) {
      console.error('Error handling comment submission:', err);
      // Since the API call was already made in CommentForm, just log the error
    }
  };

  const handleDeleteComment = async (commentId) => {
    const currentUserId = localStorage.getItem('userId');
    const comment = comments.find(c => c.id === commentId);
    
    if (!comment) return;
      // Check if user can delete this comment
    const canDelete = isOwner || (currentUserId && currentUserId === comment.createdById);
    if (!canDelete) {
      alert(t('boards.notAuthorizedDelete'));
      return;
    }
    
    const confirmed = window.confirm(t('boards.confirmDeleteComment'));
    if (!confirmed) return;

    setDeletingComment(commentId);
    
    try {
      await api.delete(`/comments/${commentId}`);
      
      // Refresh comments for this board
      const commentsResponse = await api.get(`/comments/board/${boardId}`);
      setComments(commentsResponse.data);
        } catch (err) {
      console.error('Error deleting comment:', err);
      alert(t('boards.failedToDeleteComment'));
    } finally {
      setDeletingComment(null);
    }
  };

  const handleDeleteBoard = async () => {
    if (!boardId || !isOwner) return;
      const confirmed = window.confirm(t('boards.confirmDeleteBoard', { title: board?.title }));
    if (!confirmed) return;

    try {
      await api.delete(`/boards/${boardId}`);
      // Redirect to dashboard after successful deletion
      router.push('/dashboard');    } catch (err) {
      console.error('Error deleting board:', err);
      alert(t('boards.failedToDeleteBoard'));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6" role="alert">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error || t('boards.boardNotFound')}
          </p>
        </div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="text-primary hover:text-primary-dark flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          {t('boards.returnToDashboard')}
        </button>
      </div>
    );
  }
  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const localeCode = locale === 'tr' ? 'tr-TR' : 'en-US';
    return new Intl.DateTimeFormat(localeCode, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header with enhanced back button and breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-text-secondary dark:text-purple-300 hover:text-primary dark:hover:text-purple-200 transition-all duration-200 group"
          >
            <div className="flex items-center bg-white dark:bg-purple-800 rounded-full px-4 py-2 shadow-md hover:shadow-lg transition-all duration-200 group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">{t('boards.back')}</span>
            </div>
          </button>
          
          {/* Board privacy indicator */}
          {board && (
            <div className="flex items-center bg-white dark:bg-purple-800 rounded-full px-4 py-2 shadow-md">
              {board.isPublic ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">{t('boards.public')}</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{t('boards.private')}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
        {/* Board header with enhanced design */}
      <div className="relative bg-gradient-to-br from-white to-purple-50/30 dark:from-purple-800 dark:to-purple-900/70 rounded-2xl shadow-xl border border-purple-100/50 dark:border-purple-700/50 overflow-hidden mb-8">
        {/* Cover image - displayed if board has a coverImage */}
        {board.coverImage && (
          <div className="relative w-full h-56 md:h-72 overflow-hidden">
            <Image
              src={board.coverImage}
              alt={`${board.title} cover image`}
              width={1200}
              height={400}
              className="w-full h-full object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            
            {/* Board actions overlay */}
            {isOwner && (
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => setIsEditMode(true)}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 text-white p-3 rounded-full hover:bg-white/30 transition-all duration-200 hover:scale-110"
                  title={t('boards.editBoardTitle')}
                  aria-label={t('boards.editBoardTitle')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={handleDeleteBoard}
                  className="bg-red-500/80 backdrop-blur-sm border border-red-400/30 text-white p-3 rounded-full hover:bg-red-600/90 transition-all duration-200 hover:scale-110"
                  title={t('boards.deleteBoardTitle')}
                  aria-label={t('boards.deleteBoardTitle')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="p-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary dark:text-purple-100 mb-4 leading-tight">{board.title}</h1>
              {board.description && (
                <p className="text-lg text-text-secondary dark:text-purple-300 mb-6 leading-relaxed max-w-3xl">{board.description}</p>
              )}
              
              {/* Board metadata with enhanced styling */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-text-secondary dark:text-purple-300">
                <div className="flex items-center bg-purple-100/50 dark:bg-purple-700/30 px-3 py-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">{board.createdBy || t('boards.unknown')}</span>
                </div>
                <div className="flex items-center bg-purple-100/50 dark:bg-purple-700/30 px-3 py-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{formatDate(board.createdAt)}</span>
                </div>
                <div className="flex items-center bg-purple-100/50 dark:bg-purple-700/30 px-3 py-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{posts.length} {t('boards.posts')}</span>
                </div>
              </div>
            </div>
            
            {/* Board actions - only shown when no cover image */}
            {!board.coverImage && isOwner && (
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditMode(true)}
                  className="bg-primary dark:bg-purple-600 hover:bg-primary-dark dark:hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  title={t('boards.editBoardTitle')}
                  aria-label={t('boards.editBoardTitle')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={handleDeleteBoard}
                  className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  title={t('boards.deleteBoardTitle')}
                  aria-label={t('boards.deleteBoardTitle')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Edit Board Form */}
      {isEditMode && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">{t('boards.editBoard')}</h2>
          
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
              <p className="text-sm">{submitError}</p>
            </div>
          )}
          
          <form onSubmit={handleEditBoardSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-title" className="label">{t('boards.title')} *</label>
              <input
                type="text"
                id="edit-title"
                name="title"
                value={editBoardData.title}
                onChange={handleEditBoardChange}
                className="input"
                required
                disabled={isSubmitting}
                placeholder={t('boards.enterTitle')}
              />
            </div>
            
            <div>
              <label htmlFor="edit-description" className="label">{t('boards.description')}</label>
              <textarea
                id="edit-description"
                name="description"
                value={editBoardData.description}
                onChange={handleEditBoardChange}
                className="input resize-y"
                rows={3}
                disabled={isSubmitting}
                placeholder={t('boards.enterDescription')}
              />
            </div>
            
            <div className="flex items-center">              <input
                type="checkbox"
                id="edit-isPublic"
                name="isPublic"
                checked={editBoardData.isPublic}
                onChange={handleEditBoardChange}
                className="checkbox mr-2"
                disabled={isSubmitting}
              /><label htmlFor="edit-isPublic" className="text-sm text-text-primary">
                {t('boards.makePublic')}
              </label>
            </div>
            
            <div>
              <label htmlFor="edit-coverImage" className="label">{t('boards.coverImage')}</label>
              <input
                type="file"
                id="edit-coverImage"
                name="coverImage"
                accept="image/*"
                onChange={handleEditCoverImageChange}
                className="block w-full text-sm text-text-secondary
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary file:text-white
                  hover:file:bg-primary-dark
                  focus:outline-none"
                disabled={isSubmitting}
              />
              
              {editBoardData.coverImagePreview && (
                <div className="mt-3 p-2 border border-gray-200 rounded-md bg-gray-50 inline-block">
                  <Image 
                    src={editBoardData.coverImagePreview} 
                    alt="Cover image preview" 
                    width={200}
                    height={100}
                    className="h-20 w-32 object-cover rounded"
                    unoptimized
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="btn px-4 py-2 border border-gray-300 text-text-primary"
                disabled={isSubmitting}
              >
                {t('boards.cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-primary flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t('boards.updating')}</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('boards.updateBoard')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}        {/* New post form with enhanced design */}
      {isOwner && !isEditMode && (
        <div className="mb-8">
          {!newPostVisible ? (
            <div className="bg-gradient-to-r from-primary to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">{t('boards.addNewPost')}</h3>
                  <p className="text-purple-100 text-sm">{t('boards.shareYourMemories')}</p>
                </div>
                <button
                  onClick={() => setNewPostVisible(true)}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-full font-medium hover:bg-white/30 transition-all duration-200 hover:scale-105 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  {t('boards.createPost')}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white to-purple-50/30 dark:from-purple-800 dark:to-purple-900/70 rounded-2xl shadow-xl border border-purple-100/50 dark:border-purple-700/50 p-8">
              <div className="flex items-center mb-6">
                <div className="bg-primary rounded-full p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary dark:text-purple-100">{t('boards.createNewPost')}</h2>
                  <p className="text-text-secondary dark:text-purple-300 text-sm">{t('boards.addPhotoAndNote')}</p>
                </div>
              </div>
              
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
                  <p className="text-sm">{submitError}</p>
                </div>
              )}
              
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <label htmlFor="note" className="label">{t('boards.note')}</label>
                  <textarea
                    id="note"
                    name="note"
                    value={newPost.note}
                    onChange={handleNewPostChange}
                    className="input resize-y"
                    rows={3}
                    required
                    disabled={isSubmitting}
                    placeholder={t('boards.writeNoteHere')}
                  />
                </div>
                
                <div>
                  <label htmlFor="image" className="label">{t('boards.image')}</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-text-secondary
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary file:text-white
                      hover:file:bg-primary-dark
                      focus:outline-none"
                    disabled={isSubmitting}
                    required
                  />
                    {newPost.previewUrl && (
                    <div className="mt-4 relative">
                      <div className="relative w-full max-w-sm mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md">
                        <Image 
                          src={newPost.previewUrl} 
                          alt="Preview" 
                          width={400}
                          height={300}
                          className="w-full h-48 object-cover"
                          unoptimized
                        />
                        <div className="absolute top-2 right-2">
                          <button
                            type="button"
                            onClick={() => setNewPost({...newPost, imageFile: null, previewUrl: ''})}
                            className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">{t('boards.readyToUpload')}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">                  <button
                    type="button"
                    onClick={() => setNewPostVisible(false)}
                    className="btn px-4 py-2 border border-gray-300 text-text-primary"
                    disabled={isSubmitting}
                  >
                    {t('boards.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{t('boards.uploading')}</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{t('boards.post')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
        {/* Posts section with enhanced styling */}
      <div className="mb-12">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-2xl p-6 mb-8 border border-purple-100 dark:border-purple-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-primary to-purple-600 rounded-full p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary dark:text-purple-100">{t('boards.posts')}</h2>
                <p className="text-text-secondary dark:text-purple-300 text-sm">{t('boards.memoriesCollection')}</p>
              </div>
            </div>
            <div className="bg-white/70 dark:bg-purple-800/70 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-200 dark:border-purple-600/50">
              <span className="text-primary dark:text-purple-200 font-semibold text-lg">{posts.length}</span>
            </div>
          </div>
        </div>
        
        {posts.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-purple-50/30 dark:from-purple-800/50 dark:to-purple-900/30 rounded-2xl p-12 text-center border border-purple-100/50 dark:border-purple-700/50 shadow-lg">
            <div className="bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-700 dark:to-purple-600 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-600 dark:text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary dark:text-purple-100 mb-2">{t('boards.noPostsYet')}</h3>
            <p className="text-text-secondary dark:text-purple-300 mb-6">{t('boards.startSharingMemories')}</p>
            {isOwner && (
              <button
                onClick={() => setNewPostVisible(true)}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {t('boards.createFirstPost')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {posts.map(post => (
              <PostCard 
                key={post.id}
                post={post} 
                deletable={isOwner}
                onDelete={() => {
                  // Refresh the posts list after deletion
                  api.get(`/posts/board/${boardId}`)
                    .then(response => setPosts(response.data))
                    .catch(err => console.error('Error fetching posts:', err));
                }}
              />
            ))}
          </div>
        )}
      </div>      {/* Board Comments Section with enhanced styling */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100/50 dark:from-blue-900/30 dark:to-indigo-800/20 rounded-2xl p-6 mb-8 border border-blue-100 dark:border-blue-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary dark:text-blue-100">{t('boards.comments')}</h2>
                <p className="text-text-secondary dark:text-blue-300 text-sm">{t('boards.conversationsAndThoughts')}</p>
              </div>
            </div>
            <div className="bg-white/70 dark:bg-blue-800/70 backdrop-blur-sm rounded-full px-4 py-2 border border-blue-200 dark:border-blue-600/50">
              <span className="text-blue-600 dark:text-blue-200 font-semibold text-lg">{comments.length}</span>
            </div>
          </div>
        </div>
        
        {/* Display existing comments with enhanced styling */}
        <div className="bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800/50 dark:to-gray-900/30 rounded-2xl p-6 mb-6 border border-gray-100/50 dark:border-gray-700/50 shadow-lg">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100 mb-2">{t('boards.noCommentsYet')}</h3>
              <p className="text-text-secondary dark:text-gray-300">{t('boards.startConversation')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => {
                const currentUserId = localStorage.getItem('userId');
                const canDelete = isOwner || (currentUserId && currentUserId === comment.createdById);
                
                return (
                  <div key={comment.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-5 rounded-xl relative border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-200">
                    {/* Delete button for authorized users */}
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingComment === comment.id}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                        title={t('comments.deleteComment')}
                        aria-label={t('comments.deleteComment')}
                      >
                        {deletingComment === comment.id ? (
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    )}
                    
                    <div className="flex flex-col space-y-3 pr-8">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-semibold text-text-primary dark:text-gray-100">{comment.createdBy || t('comments.unknownUser')}</span>
                          <span className="mx-2 text-gray-400">&bull;</span>
                          <span className="text-text-secondary dark:text-gray-400 text-xs">{formatDate(comment.createdAt)}</span>
                        </div>
                      </div>
                      <div className="bg-gray-50/50 dark:bg-gray-700/30 rounded-lg p-4 border-l-4 border-blue-400 dark:border-blue-500">
                        <p className="text-text-primary dark:text-gray-200 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Add new comment form with enhanced styling */}
        <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-blue-800/20 dark:to-blue-900/10 rounded-2xl p-6 border border-blue-100/50 dark:border-blue-700/50 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary dark:text-blue-100">{t('boards.addComment')}</h3>
          </div>
          <CommentForm onSuccess={handleCommentSubmit} boardId={boardId} />
        </div>
      </div>
    </div>
  );
}
                       