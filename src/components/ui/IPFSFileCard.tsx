import React from 'react';
import { 
  DocumentIcon, 
  DocumentDuplicateIcon,
  LinkIcon,
  GlobeAltIcon 
} from '@heroicons/react/24/outline';
import { config } from '../../config/environment';

interface IPFSFile {
  name: string;
  type?: string;
  size?: number;
  ipfsUrl?: string;
  gatewayUrl?: string;
  hash?: string;
  src?: string;
}

interface IPFSFileCardProps {
  file: IPFSFile;
  index: number;
  showPreview?: boolean;
}

const IPFSFileCard: React.FC<IPFSFileCardProps> = ({
  file,
  index,
  showPreview = false
}) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type?: string) => {
    if (!type) return <DocumentIcon className="h-5 w-5 text-slate-400" />;
    
    if (type.startsWith('image/')) {
      return <div className="text-blue-400">🖼️</div>;
    }
    if (type.includes('pdf')) {
      return <div className="text-red-400">📄</div>;
    }
    if (type.includes('text') || type.includes('json')) {
      return <div className="text-green-400">📝</div>;
    }
    return <DocumentIcon className="h-5 w-5 text-slate-400" />;
  };

  // Determine URLs
  const cid = file.hash || file.ipfsUrl?.replace('ipfs://', '') || file.src?.replace('ipfs://', '');
  const pinataUrl = cid ? `https://${config.pinataGateway}/ipfs/${cid}` : file.gatewayUrl;
  const ipfsNativeUrl = cid ? `ipfs://${cid}` : file.ipfsUrl;

  return (
    <div className="border border-slate-600 rounded-lg p-4 bg-slate-800/50 hover:bg-slate-800/70 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {getFileIcon(file.type)}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm text-slate-300 font-medium truncate">
              {file.name || `File ${index + 1}`}
            </h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
              {file.type && <span>Tipo: {file.type}</span>}
              {file.size && <span>Dimensione: {formatFileSize(file.size)}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Preview for images */}
      {showPreview && file.type?.startsWith('image/') && pinataUrl && (
        <div className="mb-3">
          <img 
            src={pinataUrl}
            alt={file.name || 'File preview'}
            className="w-full max-w-32 h-20 object-cover rounded border border-slate-600"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* CID Information */}
      {cid && (
        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-1">Content Identifier (CID):</p>
          <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
            <p className="text-xs text-slate-300 font-mono break-all">
              {cid}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Gateway Pinata */}
        {pinataUrl && (
          <a
            href={pinataUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 bg-green-900/30 text-green-400 rounded border border-green-800 hover:bg-green-900/50 transition-colors flex items-center gap-1 no-underline"
            title="Apri tramite Gateway Pinata"
          >
            <LinkIcon className="h-3 w-3" />
            Gateway Pinata
          </a>
        )}

        {/* IPFS Native */}
        {ipfsNativeUrl && (
          <a
            href={ipfsNativeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 bg-purple-900/30 text-purple-400 rounded border border-purple-800 hover:bg-purple-900/50 transition-colors flex items-center gap-1 no-underline"
            title="Apri con protocollo IPFS nativo"
          >
            <GlobeAltIcon className="h-3 w-3" />
            IPFS Nativo
          </a>
        )}

        {/* View/Download */}
        {pinataUrl && (
          <a
            href={pinataUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 bg-blue-900/30 text-blue-400 rounded border border-blue-800 hover:bg-blue-900/50 transition-colors flex items-center gap-1 no-underline"
            title="Visualizza file"
          >
            <LinkIcon className="h-3 w-3" />
            Visualizza
          </a>
        )}

        {/* Copy CID */}
        {cid && (
          <button
            onClick={() => copyToClipboard(cid)}
            className="text-xs px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded border border-slate-500 transition-colors flex items-center gap-1"
            title="Copia CID negli appunti"
          >
            <DocumentDuplicateIcon className="h-3 w-3" />
            Copia CID
          </button>
        )}

        {/* Copy URL */}
        {pinataUrl && (
          <button
            onClick={() => copyToClipboard(pinataUrl)}
            className="text-xs px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded border border-slate-500 transition-colors flex items-center gap-1"
            title="Copia URL Gateway"
          >
            <LinkIcon className="h-3 w-3" />
            Copia URL
          </button>
        )}
      </div>
    </div>
  );
};

export default IPFSFileCard; 