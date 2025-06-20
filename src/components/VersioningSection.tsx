import React, { useState } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { VersionCard, SkeletonVersioning } from './ui';

interface VersionInfo {
  version: number;
  transactionId: string;
  timestamp: number;
  reserveAddress: string;
  cidInfo?: {
    success: boolean;
    cid?: string;
    gatewayUrl?: string;
    error?: string;
  };
  changes: string[];
  cid?: string;
  gatewayUrl?: string;
  decodedInfo?: string;
  cidDetails?: {
    version: number;
    codec: string;
    hashType: string;
    originalAddress: string;
  };
}

interface VersioningSectionProps {
  versioningInfo: VersionInfo[];
  loading?: boolean;
}

export const VersioningSection: React.FC<VersioningSectionProps> = ({
  versioningInfo,
  loading = false
}) => {
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set());

  const toggleVersion = (versionNumber: number) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionNumber)) {
      newExpanded.delete(versionNumber);
    } else {
      newExpanded.add(versionNumber);
    }
    setExpandedVersions(newExpanded);
  };

  if (loading) {
    return <SkeletonVersioning />;
  }

  if (!versioningInfo || versioningInfo.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
        <div className="text-center">
          <ClockIcon className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Nessuna Storia delle Versioni
          </h3>
          <p className="text-slate-400">
            Questo asset non ha ancora una storia delle versioni disponibile.
          </p>
        </div>
      </div>
    );
  }

  // Sort versions by timestamp (newest first)
  const sortedVersions = [...versioningInfo].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClockIcon className="h-6 w-6 text-slate-400" />
          <h2 className="text-2xl font-bold text-white">
            Storia delle Versioni
          </h2>
          <span className="bg-blue-900/30 text-blue-400 text-sm font-medium px-3 py-1 rounded-full border border-blue-800">
            {sortedVersions.length} {sortedVersions.length === 1 ? 'versione' : 'versioni'}
          </span>
        </div>
      </div>

      {/* Version Cards */}
      <div className="space-y-4">
        {sortedVersions.map((version, index) => {
          const isLatest = index === 0;
          const isExpanded = expandedVersions.has(version.version);
          
          return (
            <VersionCard
              key={version.version}
              version={version}
              isLatest={isLatest}
              isExpanded={isExpanded}
              onToggle={() => toggleVersion(version.version)}
            />
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <ClockIcon className="h-4 w-4" />
          <span>
            Le versioni sono ordinate dalla più recente alla più vecchia. 
            Ogni versione rappresenta una modifica ai metadati dell'asset registrata su blockchain.
          </span>
        </div>
      </div>
    </div>
  );
}; 