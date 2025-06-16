import React from 'react';
import { SkeletonHeader, SkeletonGrid, SkeletonCard, SkeletonMetadata, SkeletonVersioning } from './Skeleton';

export const AssetDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <SkeletonHeader />
      
      {/* Main Content Skeleton */}
      <SkeletonCard>
        <SkeletonGrid cols={3} rows={2} />
      </SkeletonCard>
      
      {/* Description Skeleton */}
      <SkeletonCard />
      
      {/* NFT Metadata e Versioning Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonMetadata />
        <SkeletonVersioning />
      </div>
      
      {/* Technical Metadata Skeleton */}
      <SkeletonCard>
        <SkeletonGrid cols={2} rows={3} />
      </SkeletonCard>
    </div>
  );
}; 