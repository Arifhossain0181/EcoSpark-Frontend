'use client';

import { useEffect, useState } from 'react';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  const [open, setOpen] = useState<boolean>(false);
  const [unread, setUnread] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !open) {
      const timeout = setTimeout(() => setUnread(true), 3000);
      return () => clearTimeout(timeout);
    }
  }, [mounted, open]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 68,
          right: 0,
          transform: open ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transformOrigin: 'bottom right',
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {open && (
          <ChatWindow onClose={() => setOpen(false)} />
        )}
      </div>

      <button
        onClick={() => {
          setOpen((prev) => !prev);
          setUnread(false);
        }}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: open ? '#15803d' : '#16a34a',
          border: 'none',
          boxShadow: '0 4px 20px rgba(22,163,74,0.45)',
          cursor: 'pointer',
          fontSize: 24,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s',
          position: 'relative',
        }}
        title="EcoSpark Assistant"
      >
        <span
          style={{
            display: 'inline-block',
            transition: 'transform 0.3s',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          {open ? '✕' : '💬'}
        </span>

        {unread && !open && (
          <span
            style={{
              position: 'absolute',
              top: 3,
              right: 3,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#ef4444',
              border: '2px solid white',
            }}
          />
        )}
      </button>

      <style>{`
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
