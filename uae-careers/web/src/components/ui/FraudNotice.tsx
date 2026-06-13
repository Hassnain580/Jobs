'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface FraudNoticeProps {
  message?: string;
  cookieKey?: string;
}

const DEFAULT_MESSAGE =
  '⚠️ Notice: uaecareer.ae is not a recruiter. We only share publicly available walk-in opportunities. Never pay anyone for job applications, interviews, tests, or recruitment processes. Genuine walk-ins are always free. Report fraud to: ask@uaecareer.ae';

export default function FraudNotice({
  message = DEFAULT_MESSAGE,
  cookieKey = 'fraud_notice_dismissed',
}: FraudNoticeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check cookie/localStorage for dismissal
    try {
      const dismissed = localStorage.getItem(cookieKey);
      if (!dismissed) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [cookieKey]);

  function dismiss() {
    try {
      localStorage.setItem(cookieKey, '1');
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-amber-800 flex-1 leading-relaxed">{message}</p>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="text-amber-500 hover:text-amber-700 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
