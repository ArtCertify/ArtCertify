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

  const getFileExtension = (fileName: string): string => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const getFileIcon = (type: string, fileName: string) => {
    const extension = getFileExtension(fileName);
    
    // Prima controlla l'estensione per maggiore precisione
    if (extension === 'pdf') return DocumentTextIcon;
    if (extension === 'doc' || extension === 'docx') return DocumentIcon;
    if (extension === 'xls' || extension === 'xlsx') return TableCellsIcon;
    if (extension === 'ppt' || extension === 'pptx') return PresentationChartBarIcon;
    if (extension === 'zip' || extension === 'rar' || extension === '7z') return ArchiveBoxIcon;
    if (extension === 'txt' || extension === 'json' || extension === 'xml' || extension === 'csv') return CodeBracketIcon;
    if (extension === 'mp3' || extension === 'wav' || extension === 'flac') return SpeakerWaveIcon;
    if (extension === 'mp4' || extension === 'avi' || extension === 'mov') return VideoCameraIcon;
    if (extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif' || extension === 'webp') return PhotoIcon;
    
    // Fallback al tipo MIME
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

  const getFileCategory = (type: string, fileName: string): string => {
    const extension = getFileExtension(fileName);
    
    // Prima controlla l'estensione per maggiore precisione
    if (extension === 'pdf') return 'PDF';
    if (extension === 'doc' || extension === 'docx') return 'Word';
    if (extension === 'xls' || extension === 'xlsx') return 'Excel';
    if (extension === 'ppt' || extension === 'pptx') return 'PowerPoint';
    if (extension === 'zip' || extension === 'rar' || extension === '7z') return 'Archivio';
    if (extension === 'txt') return 'Testo';
    if (extension === 'json') return 'JSON';
    if (extension === 'xml') return 'XML';
    if (extension === 'csv') return 'CSV';
    if (extension === 'mp3' || extension === 'wav' || extension === 'flac') return 'Audio';
    if (extension === 'mp4' || extension === 'avi' || extension === 'mov') return 'Video';
    if (extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif' || extension === 'webp') return 'Immagine';
    
    // Fallback al tipo MIME
    if (type.startsWith('image/')) return 'Immagine';
    if (type.startsWith('video/')) return 'Video';
    if (type.startsWith('audio/')) return 'Audio';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'Archivio';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'Excel';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'PowerPoint';
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

  const IconComponent = getFileIcon(fileType, fileName);
  const isImage = fileType.startsWith('image/');
  const isVideo = fileType.startsWith('video/');
  const isAudio = fileType.startsWith('audio/');

  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 p-3 ${className}`}>
      {/* Header con icona, nome e azioni */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-white truncate" title={fileName}>{fileName}</h3>
            <p className="text-xs text-slate-400">{getFileCategory(fileType, fileName)} • {formatFileSize(fileSize)}</p>
          </div>
        </div>
        <div className="flex space-x-1 flex-shrink-0">
          <button
            onClick={handleView}
            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded border border-slate-600 transition-colors"
          >
            Visualizza
          </button>
          <button
            onClick={handleDownload}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded flex items-center space-x-1 transition-colors"
          >
            <ArrowDownTrayIcon className="w-3 h-3" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Preview Area - Quadrata */}
      <div className="bg-slate-900 rounded border border-slate-700 p-2">
        {isImage && !imageError ? (
          <div className="relative w-full aspect-square">
            <img
              src={gatewayUrl}
              alt={fileName}
              className="w-full h-full object-contain rounded"
              onError={() => setImageError(true)}
            />
          </div>
        ) : isVideo ? (
          <div className="relative w-full aspect-square">
            <video
              src={gatewayUrl}
              controls
              className="w-full h-full rounded"
              preload="metadata"
            >
              Il tuo browser non supporta il tag video.
            </video>
          </div>
        ) : isAudio ? (
          <div className="relative w-full aspect-square flex items-center justify-center">
            <audio
              src={gatewayUrl}
              controls
              className="w-full max-w-xs"
              preload="metadata"
            >
              Il tuo browser non supporta il tag audio.
            </audio>
          </div>
        ) : (
          <div className="w-full aspect-square flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center mb-3">
              <IconComponent className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-400 text-xs font-medium">
              {getFileCategory(fileType, fileName)}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              {formatFileSize(fileSize)}
            </p>
          </div>
        )}
      </div>

      {/* File Info - Compatta */}
      <div className="mt-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Tipo:</span>
          <span className="text-white">{fileType}</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-slate-400">Dimensione:</span>
          <span className="text-white">{formatFileSize(fileSize)}</span>
        </div>
      </div>
    </div>
  );
};
