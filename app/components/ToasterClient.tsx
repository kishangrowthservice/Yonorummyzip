'use client';

import { Toaster } from 'sonner';

export default function ToasterClient() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand={false}
      duration={4000}
      toastOptions={{
        style: {
          fontFamily: "'Inter', sans-serif",
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        },
      }}
    />
  );
}
