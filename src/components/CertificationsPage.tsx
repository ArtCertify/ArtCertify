import React from 'react';
import { CertificationForm } from './forms/CertificationForm';

export const CertificationsPage: React.FC = () => {
  const handleBack = () => {
    // Navigate back to dashboard or previous page
    window.history.back();
  };

  return <CertificationForm onBack={handleBack} />;
};