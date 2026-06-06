import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '1.5rem',
      marginTop: '2rem',
      borderTop: '1px solid var(--border)',
      color: 'var(--text-muted)',
      fontSize: '0.9rem',
      width: '100%',
      backgroundColor: 'transparent'
    }}>
      <div style={{ fontWeight: '500' }}>&copy; {new Date().getFullYear()} HealSpace. All rights reserved.</div>
      <div style={{ marginTop: '0.5rem' }}>
        Made with ❤️ by <strong>Arhaq</strong>
      </div>
      <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <a href="https://instagram.com/arxhaq" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
          📷 Instagram: @arxhaq
        </a>
        <a href="https://github.com/arhaqx" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
          🐙 GitHub: arhaqx
        </a>
      </div>
    </footer>
  );
}
