import React from 'react';
import { ArtifactForm } from './forms/ArtifactForm';

export const CertificationsPage: React.FC = () => {
  const handleBack = () => {
    // Navigate back to dashboard or previous page
    window.history.back();
  };

  return <ArtifactForm onBack={handleBack} />;
};