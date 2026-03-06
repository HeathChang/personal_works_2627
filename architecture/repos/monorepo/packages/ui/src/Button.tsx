import React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<ButtonProps> = ({ children, ...rest }) => {
  return (
    <button
      style={{
        padding: '8px 16px',
        borderRadius: 4,
        border: '1px solid #ccc',
        backgroundColor: '#2563eb',
        color: '#ffffff',
        cursor: 'pointer'
      }}
      {...rest}
    >
      {children}
    </button>
  );
};

