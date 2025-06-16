import React from 'react';
import { SkeletonHeader, SkeletonGrid, SkeletonMetadata, SkeletonVersioning } from './Skeleton';

export const AssetDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <SkeletonHeader />
      
      {/* Main Content Skeleton */}
      <div className="bg-slate-800 rounded-lg p-6 animate-pulse">
        <SkeletonGrid cols={3} rows={2} />
      </div>
      
      {/* Description Skeleton */}
      <div className="bg-slate-800 rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-slate-600 rounded w-1/2"></div>
      </div>
      
      {/* NFT Metadata e Versioning Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonMetadata />
        <SkeletonVersioning />
      </div>
      
      {/* Technical Metadata Skeleton */}
      <div className="bg-slate-800 rounded-lg p-6 animate-pulse">
        <SkeletonGrid cols={2} rows={3} />
      </div>
    </div>
  );
}; 