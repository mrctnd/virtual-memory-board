'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const { t } = useI18n();
  const { login, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = t('auth.validation.emailRequired'); // i18n: added translation key
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.validation.emailInvalid'); // i18n: added translation key
    }
    
    if (!formData.password) {
      newErrors.password = t('auth.validation.passwordRequired'); // i18n: added translation key
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
    setErrorMessage('');
    
    try {      const response = await api.post('/auth/login', formData);
      
      // Use AuthContext login function
      if (response.data && response.data.token) {
        login(response.data.token, response.data.user);
        
        // Redirect to the original destination or dashboard
        router.push(redirectTo);} else {
        setServerError(t('auth.login.loginFailed')); // i18n: fixed translation key
      }} catch (error) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        const data = error.response.data;
        
        if (typeof data === 'string') {
          setErrorMessage(data);
        } else if (data && data.message) {
          setErrorMessage(data.message);        } else {
          setErrorMessage(t('auth.login.invalidCredentials')); // i18n: fixed translation key
        }
      } else {        setServerError(
          error.response?.data?.message || 
          t('auth.login.loginFailed') // i18n: fixed translation key
        );
      }
    }finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-md">        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary dark:text-indigo-400 mb-2 transition-colors duration-200">{t('auth.login.welcomeBack')}</h1>
          <p className="text-text-secondary dark:text-gray-400 transition-colors duration-200">{t('auth.login.subtitle')}</p>
        </div>
          {redirectTo !== '/dashboard' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-md mb-6 transition-colors duration-200" role="alert">
            <p className="text-sm">{t('auth.login.pleaseLoginToContinue')}</p>
          </div>
        )}
        
        {serverError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6 transition-colors duration-200" role="alert">
            <p className="text-sm">{serverError}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">          <div>
            <label htmlFor="email" className="label">{t('auth.form.emailAddress')}</label> {/* i18n: added translation key */}
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              placeholder={t('auth.form.emailPlaceholder')} // i18n: added translation key
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
            <div>
            <label htmlFor="password" className="label">{t('auth.form.password')}</label> {/* i18n: added translation key */}
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              placeholder={t('auth.form.passwordPlaceholder')} // i18n: added translation key
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full flex justify-center items-center"
            disabled={isSubmitting}
          >            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('auth.login.loggingIn')} {/* i18n: added translation key */}
              </>
            ) : t('auth.login.signIn')} {/* i18n: added translation key */}
          </button>            <p className="text-center text-text-secondary dark:text-gray-400 mt-4 transition-colors duration-200">
            {t('auth.login.noAccount')}{' '} {/* i18n: added translation key */}
            <Link href="/register" className="text-primary dark:text-indigo-400 hover:text-primary-dark dark:hover:text-indigo-300 font-medium transition-colors duration-200">
              {t('auth.login.registerHere')} {/* i18n: added translation key */}
            </Link>
          </p>
        </form>
        
        {errorMessage && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md transition-colors duration-200" role="alert">
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}