'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n'; // i18n: added i18n hook import

export default function CommentForm({ postId, boardId, onSuccess }) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { t } = useI18n(); // i18n: added translation function

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate comment
    if (!comment.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError('');
      try {
      // Send POST request to /comments
      const response = await api.post('/comments', {
        boardId,
        postId: postId || null,
        content: comment  // Uses 'content' to match backend DTO
      });

      // Clear the textarea on success
      setComment('');
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess({
          content: comment,
          postId: postId || null,
          response: response.data
        });
      }}catch (err) {
      console.error('Error posting comment:', err);
      setError(t('comments.failedToPost')); // i18n: fixed translation key
    } finally {
      setIsSubmitting(false);
    }
  };

  return (    <div className="mt-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded-md mb-4 transition-colors duration-200" role="alert">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <form className="space-y-4" onSubmit={handleSubmit}>        <div>
          <label htmlFor="comment" className="label sr-only">{t('comments.comment')}</label> {/* i18n: added translation key */}
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('comments.addComment')} // i18n: added translation key
            rows={3}
            className="input resize-y min-h-[80px]"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex justify-end">
          <button 
            type="submit"
            className="btn btn-primary inline-flex items-center space-x-2"
            disabled={isSubmitting || !comment.trim()}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t('comments.posting')}</span> {/* i18n: added translation key */}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                <span>{t('comments.postComment')}</span> {/* i18n: added translation key */}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}