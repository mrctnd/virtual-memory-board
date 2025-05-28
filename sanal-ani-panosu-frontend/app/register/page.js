'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessages, setErrorMessages] = useState([]);

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
      if (!formData.username.trim()) {
      newErrors.username = t('auth.validation.usernameRequired');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('auth.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.validation.emailInvalid');
    }
      if (!formData.password) {
      newErrors.password = t('auth.validation.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.validation.passwordMinLength');
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('auth.validation.firstNameRequired');
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('auth.validation.lastNameRequired');
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
    setErrorMessages([]);
      try {      const response = await api.post('/auth/register', formData);
      setSuccessMessage(t('auth.register.registrationSuccessful'));
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push('/login');
      }, 2000);} catch (error) {
      if (error.response?.status === 400) {
        const data = error.response.data;
        let messages = [];
        
        if (typeof data === 'object' && data !== null) {
          // Handle ModelState or object format
          const values = Object.values(data);
          messages = values.flat();
        } else if (Array.isArray(data)) {
          messages = data;
        } else if (typeof data === 'string') {
          messages = [data];
        }
        
        setErrorMessages(messages);      } else {        setServerError(
          error.response?.data?.message || 
          t('auth.register.registrationFailed')
        );
      }
    }finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="card w-full max-w-md">        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary dark:text-indigo-400 transition-colors duration-200">{t('auth.register.createYourAccount')}</h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1 transition-colors duration-200">{t('auth.register.joinToday')}</p>
        </div>
        
        {successMessage && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 px-4 py-3 rounded-md mb-6 transition-colors duration-200" role="alert">
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        )}
        
        {serverError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6 transition-colors duration-200" role="alert">
            <p className="text-sm">{serverError}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">            <div>
              <label htmlFor="firstName" className="label">{t('auth.form.firstName')}</label>              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input"
                placeholder={t('auth.form.firstNamePlaceholder')}
              />
              {errors.firstName && <p className="error-text">{errors.firstName}</p>}
            </div>
            
            <div>
              <label htmlFor="lastName" className="label">{t('auth.form.lastName')}</label>              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="input"
                placeholder={t('auth.form.lastNamePlaceholder')}
              />
              {errors.lastName && <p className="error-text">{errors.lastName}</p>}
            </div>
          </div>
            <div>
            <label htmlFor="username" className="label">{t('auth.form.username')}</label>            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input"
              placeholder={t('auth.form.usernamePlaceholder')}
            />
            {errors.username && <p className="error-text">{errors.username}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="label">{t('auth.form.emailAddress')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}              onChange={handleChange}
              className="input"
              placeholder={t('auth.form.emailPlaceholder')}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="password" className="label">{t('auth.form.password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}              onChange={handleChange}
              className="input"
              placeholder={t('auth.form.passwordPlaceholder')}
            />            {errors.password && <p className="error-text">{errors.password}</p>}
            <p className="text-xs text-text-secondary mt-1">{t('auth.form.passwordHint')}</p>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full flex justify-center items-center mt-6"
            disabled={isSubmitting}
          >            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('auth.register.creatingAccount')}
              </>
            ) : t('auth.register.createAccount')}
          </button>
            <p className="text-center text-text-secondary mt-4">
            {t('auth.register.alreadyHaveAccount')}{' '}
            <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
              {t('auth.register.loginHere')}
            </Link>
          </p>
        </form>
          {errorMessages.length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <h3 className="font-medium text-sm mb-2">{t('auth.register.fixErrors')}</h3>
            <ul className="list-disc list-inside space-y-1">
              {errorMessages.map((message, index) => (
                <li key={index} className="text-xs">{message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}