import React from 'react';

interface MessageProps {
  variant?: 'info' | 'danger' | 'success';
  children: React.ReactNode;
}

export default function Message({ variant = 'info', children }: MessageProps) {
  const styles = {
    info: 'bg-stone-100 border-stone-300 text-stone-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  };

  return (
    <div className={`px-4 py-3 rounded-lg border text-sm ${styles[variant]}`}>
      {children}
    </div>
  );
}
