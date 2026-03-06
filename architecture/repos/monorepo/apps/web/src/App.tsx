import React from 'react';
import { Button } from '@org/ui';
import { formatDate } from '@org/utils';

export const App: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <h1>Web App</h1>
      <p>Today: {formatDate(new Date())}</p>
      <Button onClick={() => alert('Hello from web!')}>Click me</Button>
    </div>
  );
};

