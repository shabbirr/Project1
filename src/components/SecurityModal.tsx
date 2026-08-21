import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Key, 
  Lock, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  FileCheck,
  Zap
} from 'lucide-react';
import { SecurityStatus, UserSession } from '../types';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onLogAudit?: (action: string, details: string) => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [securityState, setSecurityState] = useState<SecurityStatus>({
    dataAtRestEncryption: 'AES-256',
    inTransitEncryption: 'TLS 1.3',
    keyRotationDaysRemaining: 76,
    lastRotatedDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    activeKeyId: 'KMS-AES256-EU-GCM-8842',
    mfaEnforcement: true,
    complianceScore: 98.4,
  });
  const [isRotating, setIsRotating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/security/status')
        .then((res) => res.json())
        .then((data) => setSecurityState(data))
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRotateKey = async () => {
    if (currentUser.role !== 'ADMIN') {
      alert('Only System Administrators can execute cryptographic key rotations.');
      return;
    }

    setIsRotating(true);
    try {
      const res = await fetch('/api/security/rotate-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: currentUser.email,
          role: currentUser.role,
        }),
      });
      const data = await res.json();
      if (data.securityState) {
        setSecurityState(data.securityState);
        setSuccessMessage('Master AES-256 encryption key rotated successfully. 90-day countdown reset.');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Enterprise Cryptographic & Security Posture
              </h3>
              <p className="text-xs text-slate-400">
                AES-256 at Rest • TLS 1.3 in Transit • 90-Day Key Rotation Lifecycle
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
        <div className="p-6 space-y-5">
          
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Security Spec Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Data at Rest</span>
              </div>
              <p className="text-lg font-bold text-slate-900 mt-1 font-mono">
                {securityState.dataAtRestEncryption}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">GCM Block Cipher Active</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
                <Server className="w-3.5 h-3.5 text-emerald-600" />
                <span>Data in Transit</span>
              </div>
              <p className="text-lg font-bold text-slate-900 mt-1 font-mono">
                {securityState.inTransitEncryption}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">Perfect Forward Secrecy</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
                <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Compliance Score</span>
              </div>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {securityState.complianceScore}%
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">SOC2 Type II & ISO 27001</span>
            </div>

          </div>

          {/* 90-Day Key Rotation Manager */}
          <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  90-Day Key Rotation Governance
                </h4>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-mono">
                {securityState.keyRotationDaysRemaining} Days Remaining
              </span>
            </div>

            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${((90 - securityState.keyRotationDaysRemaining) / 90) * 100}%` }}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2 pt-1">
              <div>
                <p>Active Key ID: <strong className="font-mono text-slate-900">{securityState.activeKeyId}</strong></p>
                <p className="text-[11px] text-slate-500">Last rotated: {securityState.lastRotatedDate}</p>
              </div>

              <button
                id="rotate-key-now-btn"
                onClick={handleRotateKey}
                disabled={isRotating || currentUser.role !== 'ADMIN'}
                className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
                title={currentUser.role !== 'ADMIN' ? 'Requires System Administrator role' : 'Rotate active encryption key'}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                <span>{isRotating ? 'Rotating Key...' : 'Rotate Key Now'}</span>
              </button>
            </div>
          </div>

          {/* Compliance Checklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Mandatory Security Controls:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>AES-256 Volume Encryption</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>TLS 1.3 Transport Strictness</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Multi-Factor Authentication (MFA)</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Immutable Administrative Audit Trail</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Security Center
          </button>
        </div>

      </div>
    </div>
  );
};
