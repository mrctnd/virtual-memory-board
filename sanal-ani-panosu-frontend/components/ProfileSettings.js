'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import api from '@/lib/api';

export default function ProfileSettings({ user, onUpdate, onClose }) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Account form state
  const [accountForm, setAccountForm] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });

  // Personal info form state
  const [personalForm, setPersonalForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword) {
      setError(t('profile.currentPasswordRequired'));
      return false;
    }
    if (!passwordForm.newPassword) {
      setError(t('profile.newPasswordRequired'));
      return false;
    }
    if (passwordForm.newPassword.length < 6) {
      setError(t('profile.passwordTooShort'));
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError(t('profile.passwordMismatch'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let response;
      let successMessage;

      switch (activeTab) {
        case 'account':
          response = await api.put('/user/update-account', accountForm);
          successMessage = t('profile.accountUpdated');
          break;
        case 'personal':
          response = await api.put('/user/update-personal', personalForm);
          successMessage = t('profile.personalInfoUpdated');
          break;
        case 'password':
          if (!validatePasswordForm()) {
            setLoading(false);
            return;
          }
          response = await api.put('/user/change-password', passwordForm);
          successMessage = t('profile.passwordChanged');
          // Clear password form on success
          setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          break;
        default:
          throw new Error('Invalid tab');
      }

      setSuccess(successMessage);
      
      // Update user data if account or personal info was changed
      if (activeTab === 'account' || activeTab === 'personal') {
        onUpdate(response.data);
      }

      // Auto-close success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err) {
      console.error('Error updating profile:', err);
      if (err.response?.status === 400 && activeTab === 'password') {
        setError(t('profile.invalidCurrentPassword'));
      } else {
        setError(err.response?.data?.message || t('profile.updateFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="label">
                {t('profile.username')}
              </label>
              <input
                type="text"
                id="username"
                value={accountForm.username}
                onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="label">
                {t('profile.email')}
              </label>
              <input
                type="email"
                id="email"
                value={accountForm.email}
                onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                className="input w-full"
                required
              />
            </div>
          </div>
        );

      case 'personal':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="label">
                {t('profile.firstName')}
              </label>
              <input
                type="text"
                id="firstName"
                value={personalForm.firstName}
                onChange={(e) => setPersonalForm({ ...personalForm, firstName: e.target.value })}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="label">
                {t('profile.lastName')}
              </label>
              <input
                type="text"
                id="lastName"
                value={personalForm.lastName}
                onChange={(e) => setPersonalForm({ ...personalForm, lastName: e.target.value })}
                className="input w-full"
                required
              />
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="label">
                {t('profile.currentPassword')}
              </label>
              <input
                type="password"
                id="currentPassword"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="label">
                {t('profile.newPassword')}
              </label>
              <input
                type="password"
                id="newPassword"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="label">
                {t('profile.confirmPassword')}
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="input w-full"
                required
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-text-primary">{t('profile.settings')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'account'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t('profile.editAccount')}
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'personal'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t('profile.editPersonal')}
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t('profile.changePassword')}
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {renderTabContent()}

          {/* Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {t('profile.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-primary flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('profile.updating')}
                </>
              ) : (
                t('profile.save')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}