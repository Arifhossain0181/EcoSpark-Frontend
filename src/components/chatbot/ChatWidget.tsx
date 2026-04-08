'use client';

import { useState } from 'react';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
      }}
    >
      {open && (
        <div style={{ marginBottom: 16 }}>
          <ChatWindow onClose={() => setOpen(false)} />
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#6366f1',
          border: 'none',
          boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          cursor: 'pointer',
          fontSize: 26,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {open ? '×' : '💬'}
      </button>
    </div>
  );
}
