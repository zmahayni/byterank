import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
  fullWidth?: boolean;
}

export default function PageLayout({
  children,
  rightSidebar,
  fullWidth = false
}: PageLayoutProps) {
  return (
    <div style={{
      width: fullWidth ? '100%' : 'var(--content-width)',
      maxWidth: 'var(--max-content-width)',
      margin: '0 auto',
      display: 'flex',
      gap: 'var(--gap-large)',
      position: 'relative',
    }}>
      {/* Main content area */}
      <div style={{
        flex: rightSidebar ? `0 1 calc(100% - var(--sidebar-width) - var(--gap-large))` : '1 1 100%',
        padding: 'var(--section-padding)',
      }}>
        {children}
      </div>

      {/* Right sidebar (optional) */}
      {rightSidebar && (
        <div style={{
          width: 'var(--sidebar-width)',
          background: 'var(--card-bg)',
          borderLeft: '1px solid var(--card-border)',
          padding: 'var(--card-padding)',
          height: 'calc(100vh - 48px)',
          position: 'sticky',
          top: '48px',
          overflowY: 'auto',
        }}>
          {rightSidebar}
        </div>
      )}
    </div>
  );
}
