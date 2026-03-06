import React from 'react';
import { Button } from '@org/ui';
import { formatDate } from '@org/utils';

export const AdminApp: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <h1>Admin App</h1>
      <p>Last sync: {formatDate(new Date())}</p>
      <Button onClick={() => alert('Admin action!')}>Run job</Button>
    </div>
  );
};

