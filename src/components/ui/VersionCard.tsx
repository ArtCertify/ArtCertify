import React from 'react';
import { 
  ClockIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  DocumentDuplicateIcon,
  LinkIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { algorandService } from '../../services/algorand';

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

interface VersionCardProps {
  version: VersionInfo;
  isLatest: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

const VersionCard: React.FC<VersionCardProps> = ({
  version,
  isLatest,
  isExpanded,
  onToggle
}) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
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

  const truncateId = (id: string, start = 8, end = 8) => {
    if (id.length <= start + end) return id;
    return `${id.slice(0, start)}...${id.slice(-end)}`;
  };

  return (
    <div
      className={`border rounded-lg transition-all duration-200 ${
        isLatest 
          ? 'border-green-800 bg-green-900/20' 
          : 'border-slate-600 bg-slate-700/50'
      }`}
    >
      {/* Version Header - More Compact */}
      <div
        className="p-3 cursor-pointer hover:bg-opacity-80 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Smaller Version Badge */}
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
              isLatest 
                ? 'bg-green-900/30 text-green-400 border border-green-800' 
                : 'bg-slate-600 text-slate-300 border border-slate-500'
            }`}>
              v{version.version}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-white text-sm">
                  Versione {version.version}
                </span>
                {isLatest && (
                  <span className="bg-green-900/30 text-green-400 text-xs font-medium px-1.5 py-0.5 rounded border border-green-800 flex items-center gap-1">
                    <CheckCircleIcon className="h-3 w-3" />
                    Corrente
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  {formatTimestamp(version.timestamp)}
                </div>
                <div className="flex items-center gap-1">
                  <DocumentDuplicateIcon className="h-3 w-3" />
                  {truncateId(version.transactionId, 6, 6)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Compact Status Indicators */}
            {version.cidInfo?.success ? (
              <span className="bg-blue-900/30 text-blue-400 text-xs font-medium px-1.5 py-0.5 rounded border border-blue-800 flex items-center gap-1">
                <CheckCircleIcon className="h-3 w-3" />
                CID
              </span>
            ) : version.cidInfo?.error ? (
              <span className="bg-red-900/30 text-red-400 text-xs font-medium px-1.5 py-0.5 rounded border border-red-800 flex items-center gap-1">
                <ExclamationCircleIcon className="h-3 w-3" />
                Errore
              </span>
            ) : null}
            
            {/* Smaller Expand/Collapse */}
            {isExpanded ? (
              <ChevronUpIcon className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </div>

        {/* Compact Changes Summary */}
        {version.changes && version.changes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {version.changes.map((change, changeIndex) => (
              <span
                key={changeIndex}
                className="bg-slate-600/50 text-slate-300 text-xs px-1.5 py-0.5 rounded border border-slate-500"
              >
                {change}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-600 bg-slate-800/50">
          <div className="p-3 space-y-4">
            
            {/* Transaction Information */}
            <div>
              <h4 className="font-medium text-white mb-2 flex items-center gap-2 text-sm">
                <DocumentDuplicateIcon className="h-4 w-4 text-slate-400" />
                Dettagli Transazione
              </h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Transaction ID */}
                <div className="bg-slate-700/50 p-2 rounded border border-slate-600">
                  <p className="text-xs text-slate-400 mb-1">Transaction ID:</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-300 font-mono break-all">
                      {version.transactionId}
                    </p>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => copyToClipboard(version.transactionId)}
                        className="p-1 hover:bg-slate-600 rounded text-slate-400 hover:text-white"
                        title="Copia Transaction ID"
                      >
                        <DocumentDuplicateIcon className="h-3 w-3" />
                      </button>
                      <a
                        href={algorandService.getTransactionExplorerUrl(version.transactionId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-slate-600 rounded text-slate-400 hover:text-white"
                        title="Visualizza su explorer"
                      >
                        <LinkIcon className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Reserve Address */}
                <div className="bg-slate-700/50 p-2 rounded border border-slate-600">
                  <p className="text-xs text-slate-400 mb-1">Reserve Address:</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-300 font-mono break-all">
                      {version.reserveAddress}
                    </p>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => copyToClipboard(version.reserveAddress)}
                        className="p-1 hover:bg-slate-600 rounded text-slate-400 hover:text-white"
                        title="Copia Reserve Address"
                      >
                        <DocumentDuplicateIcon className="h-3 w-3" />
                      </button>
                      <a
                        href={algorandService.getAddressExplorerUrl(version.reserveAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-slate-600 rounded text-slate-400 hover:text-white"
                        title="Visualizza su explorer"
                      >
                        <LinkIcon className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CID Information */}
            {version.cidInfo?.success && version.cidInfo.cid && (
              <div>
                <h4 className="font-medium text-white mb-2 flex items-center gap-2 text-sm">
                  <GlobeAltIcon className="h-4 w-4 text-slate-400" />
                  Informazioni CID
                </h4>
                
                <div className="space-y-2">
                  {/* CID */}
                  <div className="bg-slate-700/50 p-2 rounded border border-slate-600">
                    <p className="text-xs text-slate-400 mb-1">CID:</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-300 font-mono break-all">
                        {version.cidInfo.cid}
                      </p>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => copyToClipboard(version.cidInfo!.cid!)}
                          className="p-1 hover:bg-slate-600 rounded text-slate-400 hover:text-white"
                          title="Copia CID"
                        >
                          <DocumentDuplicateIcon className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(`ipfs://${version.cidInfo!.cid!}`)}
                          className="p-1 hover:bg-slate-600 rounded text-slate-400 hover:text-white"
                          title="Copia URL IPFS"
                        >
                          <LinkIcon className="h-3 w-3" />
                        </button>
                        <a
                          href={version.cidInfo.gatewayUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-slate-600 rounded text-slate-400 hover:text-white"
                          title="Apri su Gateway"
                        >
                          <GlobeAltIcon className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* CID Details */}
                  {version.cidDetails && (
                    <div className="bg-slate-700/50 p-2 rounded border border-slate-600">
                      <p className="text-xs text-slate-400 mb-1">Dettagli CID:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">Versione:</span>
                          <span className="text-slate-300 ml-2">{version.cidDetails.version}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Codec:</span>
                          <span className="text-slate-300 ml-2">{version.cidDetails.codec}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Hash:</span>
                          <span className="text-slate-300 ml-2">{version.cidDetails.hashType}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionCard; 