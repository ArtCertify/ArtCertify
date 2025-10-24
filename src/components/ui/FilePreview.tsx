import React, { useState } from 'react';
import { 
  DocumentIcon, 
  PhotoIcon, 
  VideoCameraIcon, 
  SpeakerWaveIcon,
  ArchiveBoxIcon,
  CodeBracketIcon,
  TableCellsIcon,
  PresentationChartBarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface FilePreviewProps {
  fileName: string;
  fileType: string;
  fileSize: number;
  gatewayUrl: string;
  ipfsUrl: string;
  className?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  fileName,
  fileType,
  fileSize,
  gatewayUrl,
  ipfsUrl,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return PhotoIcon;
    if (type.startsWith('video/')) return VideoCameraIcon;
    if (type.startsWith('audio/')) return SpeakerWaveIcon;
    if (type.includes('pdf')) return DocumentTextIcon;
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return ArchiveBoxIcon;
    if (type.includes('excel') || type.includes('spreadsheet')) return TableCellsIcon;
    if (type.includes('powerpoint') || type.includes('presentation')) return PresentationChartBarIcon;
    if (type.includes('text') || type.includes('json') || type.includes('xml')) return CodeBracketIcon;
    return DocumentIcon;
  };

  const getFileCategory = (type: string): string => {
    if (type.startsWith('image/')) return 'Immagine';
    if (type.startsWith('video/')) return 'Video';
    if (type.startsWith('audio/')) return 'Audio';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'Archivio';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'Foglio di calcolo';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'Presentazione';
    if (type.includes('text') || type.includes('json') || type.includes('xml')) return 'Testo';
    return 'Documento';
  };

  const handleDownload = async () => {
    try {
      // Prova prima a scaricare come blob per garantire il download anche da IPFS gateway
      const response = await fetch(gatewayUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Pulisci l'URL blob dopo un breve delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      // Fallback: apri in una nuova scheda se il download via blob fallisce
      console.warn('Download via blob failed, falling back to direct link', error);
      const link = document.createElement('a');
      link.href = gatewayUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleView = () => {
    window.open(gatewayUrl, '_blank', 'noopener,noreferrer');
  };

  const IconComponent = getFileIcon(fileType);
  const isImage = fileType.startsWith('image/');
  const isVideo = fileType.startsWith('video/');
  const isAudio = fileType.startsWith('audio/');

  return (
    <div className={`bg-slate-800 rounded-xl border border-slate-700 p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <IconComponent className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{fileName}</h3>
            <p className="text-sm text-slate-400">{getFileCategory(fileType)} • {formatFileSize(fileSize)}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleView}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg border border-slate-600 transition-colors"
          >
            Visualizza
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center space-x-1 transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
        {isImage && !imageError ? (
          <div className="relative">
            <img
              src={gatewayUrl}
              alt={fileName}
              className="w-full h-64 object-contain rounded-lg"
              onError={() => setImageError(true)}
            />
          </div>
        ) : isVideo ? (
          <div className="relative">
            <video
              src={gatewayUrl}
              controls
              className="w-full h-64 rounded-lg"
              preload="metadata"
            >
              Il tuo browser non supporta il tag video.
            </video>
          </div>
        ) : isAudio ? (
          <div className="relative">
            <audio
              src={gatewayUrl}
              controls
              className="w-full"
              preload="metadata"
            >
              Il tuo browser non supporta il tag audio.
            </audio>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center mb-4">
              <IconComponent className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-400 text-sm">
              Anteprima non disponibile per questo tipo di file
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Clicca "Visualizza" o "Download" per accedere al file
            </p>
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-400">Tipo:</span>
          <span className="text-white ml-2">{fileType}</span>
        </div>
        <div>
          <span className="text-slate-400">Dimensione:</span>
          <span className="text-white ml-2">{formatFileSize(fileSize)}</span>
        </div>
        <div className="col-span-2">
          <span className="text-slate-400">IPFS URL:</span>
          <span className="text-blue-400 ml-2 font-mono text-xs break-all">{ipfsUrl}</span>
        </div>
      </div>
    </div>
  );
};
