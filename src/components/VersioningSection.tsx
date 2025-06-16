import React, { useState } from 'react';
import { ClockIcon, DocumentDuplicateIcon, LinkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { SkeletonVersioning } from './ui/Skeleton';

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

  const toggleVersion = (version: number) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(version)) {
      newExpanded.delete(version);
    } else {
      newExpanded.add(version);
    }
    setExpandedVersions(newExpanded);
  };

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return 'Data non disponibile';
    
    // Handle both seconds and milliseconds timestamps
    const date = new Date(timestamp > 1e10 ? timestamp : timestamp * 1000);
    return date.toLocaleString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return <SkeletonVersioning />;
  }

  if (!versioningInfo || versioningInfo.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <ClockIcon className="h-6 w-6 text-slate-400" />
          <h2 className="text-xl font-semibold text-white">
            Versioning (CID History)
          </h2>
        </div>
        <p className="text-slate-400">Nessuna storia delle versioni disponibile per questo asset.</p>
      </div>
    );
  }

  // Sort versions by timestamp (newest first)
  const sortedVersions = [...versioningInfo].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <ClockIcon className="h-6 w-6 text-slate-400" />
        <h2 className="text-xl font-semibold text-white">
          Versioning (CID History)
        </h2>
        <span className="bg-blue-900/30 text-blue-400 text-sm font-medium px-2.5 py-0.5 rounded border border-blue-800">
          {sortedVersions.length} versioni
        </span>
      </div>

      <div className="space-y-4">
        {sortedVersions.map((version, index) => {
          const isExpanded = expandedVersions.has(version.version);
          const isLatest = index === 0;
          
          return (
            <div
              key={version.version}
              className={`border rounded-lg transition-all duration-200 ${
                isLatest 
                  ? 'border-green-800 bg-green-900/20' 
                  : 'border-slate-600 bg-slate-700'
              }`}
            >
              {/* Version Header */}
              <div
                className="p-4 cursor-pointer hover:bg-opacity-80 transition-colors"
                onClick={() => toggleVersion(version.version)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      isLatest 
                        ? 'bg-green-900/30 text-green-400 border border-green-800' 
                        : 'bg-slate-600 text-slate-300'
                    }`}>
                      v{version.version}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          Versione {version.version}
                        </span>
                        {isLatest && (
                          <span className="bg-green-900/30 text-green-400 text-xs font-medium px-2 py-1 rounded border border-green-800">
                            Corrente
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400">
                        {formatTimestamp(version.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {version.cidInfo?.success && (
                      <span className="bg-blue-900/30 text-blue-400 text-xs font-medium px-2 py-1 rounded border border-blue-800">
                        CID Disponibile
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Changes Summary */}
                {version.changes && version.changes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {version.changes.map((change, changeIndex) => (
                      <span
                        key={changeIndex}
                        className="bg-slate-600 text-slate-300 text-xs px-2 py-1 rounded"
                      >
                        {change}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-slate-600 p-4 bg-slate-800">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Transaction Details */}
                    <div>
                      <h4 className="font-medium text-white mb-2">Dettagli Transazione</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Transaction ID:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs text-slate-300 truncate max-w-32">
                              {version.transactionId}
                            </span>
                            <button
                              onClick={() => copyToClipboard(version.transactionId)}
                              className="p-1 hover:bg-slate-600 rounded"
                              title="Copia Transaction ID"
                            >
                              <DocumentDuplicateIcon className="h-4 w-4 text-slate-400" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Reserve Address:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs text-slate-300 truncate max-w-32">
                              {version.reserveAddress || 'Non impostato'}
                            </span>
                            {version.reserveAddress && (
                              <button
                                onClick={() => copyToClipboard(version.reserveAddress)}
                                className="p-1 hover:bg-slate-600 rounded"
                                title="Copia Reserve Address"
                              >
                                <DocumentDuplicateIcon className="h-4 w-4 text-slate-400" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CID Details */}
                    {version.cidInfo?.success && version.cid && (
                      <div>
                        <h4 className="font-medium text-white mb-2">Informazioni CID</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">CID:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs text-slate-300 truncate max-w-32">
                                {version.cid}
                              </span>
                              <button
                                onClick={() => copyToClipboard(version.cid!)}
                                className="p-1 hover:bg-slate-600 rounded"
                                title="Copia CID"
                              >
                                <DocumentDuplicateIcon className="h-4 w-4 text-slate-400" />
                              </button>
                            </div>
                          </div>
                          
                          {version.gatewayUrl && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Gateway:</span>
                              <button
                                onClick={() => openInNewTab(version.gatewayUrl!)}
                                className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                                title="Apri Gateway IPFS"
                              >
                                <LinkIcon className="h-4 w-4" />
                                <span className="text-xs">Apri IPFS</span>
                              </button>
                            </div>
                          )}

                          {version.cidDetails && (
                            <div className="mt-3 p-2 bg-slate-700 rounded text-xs">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-slate-400">Versione:</span>
                                  <span className="ml-1 font-medium text-slate-300">{version.cidDetails.version}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Codec:</span>
                                  <span className="ml-1 font-medium text-slate-300">{version.cidDetails.codec}</span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-slate-400">Hash:</span>
                                  <span className="ml-1 font-medium text-slate-300">{version.cidDetails.hashType}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Error Details */}
                    {version.cidInfo && !version.cidInfo.success && (
                      <div>
                        <h4 className="font-medium text-white mb-2">Informazioni CID</h4>
                        <div className="p-3 bg-red-900/20 border border-red-800 rounded text-sm">
                          <p className="text-red-400">
                            {version.cidInfo.error || 'Errore nella decodifica del CID'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-slate-600">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Totale versioni: {sortedVersions.length}
          </span>
          <span>
            CID disponibili: {sortedVersions.filter(v => v.cidInfo?.success).length}
          </span>
        </div>
      </div>
    </div>
  );
}; 