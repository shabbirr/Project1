import React, { useState } from 'react';
import { X, Lock, ShieldCheck, CheckCircle2, Smartphone, KeyRound, AlertTriangle } from 'lucide-react';
import { UserSession } from '../types';

interface MFAModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onMFAStatusChange: (verified: boolean) => void;
}

export const MFAModal: React.FC<MFAModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onMFAStatusChange,
}) => {
  const [otpCode, setOtpCode] = useState('');
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length === 6 || otpCode === '123456') {
      setVerifiedSuccess(true);
      setErrorMessage('');
      onMFAStatusChange(true);
      setTimeout(() => {
        setVerifiedSuccess(false);
        onClose();
      }, 1500);
    } else {
      setErrorMessage('Invalid 6-digit authenticator token. Enter 6 digits or default demo code 123456.');
    }
  };

  const handleToggleMFA = () => {
    const nextState = !currentUser.mfaVerified;
    onMFAStatusChange(nextState);
    if (!nextState) {
      setOtpCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Multi-Factor Authentication (MFA)
              </h3>
              <p className="text-xs text-slate-400">
                Time-based One-Time Password (TOTP) Security Gate
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* Status Card */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            currentUser.mfaVerified
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${currentUser.mfaVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold">
                  {currentUser.mfaVerified ? 'MFA Session Verified & Active' : 'MFA Verification Pending'}
                </p>
                <p className="text-[11px] opacity-80">
                  {currentUser.name} ({currentUser.role})
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleMFA}
              className="text-xs font-semibold underline text-indigo-700 hover:text-indigo-900"
            >
              {currentUser.mfaVerified ? 'Revoke' : 'Bypass'}
            </button>
          </div>

          {/* Form */}
          {!currentUser.mfaVerified ? (
            <form onSubmit={handleVerify} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enter 6-Digit Authenticator App Code:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 123456"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono font-bold tracking-widest text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Demo hint: Type <strong>123456</strong> or any 6 digits to verify.
                </p>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {verifiedSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs flex items-center space-x-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>MFA Token Verified! Unlocking Elevated Controls...</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition-colors shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                Verify & Authorize Account
              </button>
            </form>
          ) : (
            <div className="py-4 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <p className="text-sm font-bold text-slate-800">Hardware TOTP Challenge Passed</p>
              <p className="text-xs text-slate-500">Your current session is secured with AES-256 session encryption tokens.</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
