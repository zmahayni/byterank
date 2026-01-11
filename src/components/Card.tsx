import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  padding?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
}

export default function Card({
  children,
  title,
  padding = 'medium',
  className = '',
  style = {}
}: CardProps) {
  const getPadding = () => {
    switch (padding) {
      case 'small': return 'calc(var(--card-padding) * 0.75)';
      case 'large': return 'calc(var(--card-padding) * 1.25)';
      default: return 'var(--card-padding)';
    }
  };

  return (
    <div
      className={className}
      style={{
        background: 'var(--card-bg)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--card-shadow)',
        padding: getPadding(),
        marginBottom: 'var(--margin-bottom)',
        ...style
      }}
    >
      {title && (
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--card-title-color)',
          marginTop: 0,
          marginBottom: 'var(--gap-medium)'
        }}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
