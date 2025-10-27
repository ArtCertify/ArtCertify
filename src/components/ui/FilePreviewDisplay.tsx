import React, { useState, useRef } from 'react';
import FilePreview from './FilePreview';
import {
  XMarkIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface FilePreviewDisplayProps {
  file: File | { name: string; type: string; size?: number; url?: string };
  url?: string;
  className?: string;
  showPreview?: boolean;
  showDownload?: boolean;
  onRemove?: () => void;
}

const FilePreviewDisplay: React.FC<FilePreviewDisplayProps> = ({
  file,
  url,
  className = '',
  showPreview = true,
  showDownload = true,
  onRemove
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const getFileType = (fileName: string, mimeType: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif'].includes(extension)) {
      return 'image';
    }
    if (mimeType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp', 'ogv'].includes(extension)) {
      return 'video';
    }
    if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'].includes(extension)) {
      return 'audio';
    }
    if (mimeType === 'application/pdf' || extension === 'pdf') {
      return 'pdf';
    }
    return 'other';
  };

  const fileType = getFileType(file.name, file.type);
  const fileUrl = url || (file as any).url || '';


  const handleDownload = () => {
    if (fileUrl) {
      // Apri il file in una nuova pagina invece di scaricarlo
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const renderPreview = () => {
    if (!fileUrl) return null;

    switch (fileType) {
      case 'image':
        return (
          <div className="relative">
            <img
              src={fileUrl}
              alt={file.name}
              className="max-w-full max-h-96 object-contain rounded-lg"
            />
          </div>
        );

      case 'video':
        return (
          <div className="relative">
            <video
              ref={videoRef}
              src={fileUrl}
              className="max-w-full max-h-96 rounded-lg"
              controls
              onPlay={() => {}}
              onPause={() => {}}
            />
          </div>
        );

      case 'audio':
        return (
          <div className="relative">
            <audio
              ref={audioRef}
              src={fileUrl}
              className="w-full"
              controls
              onPlay={() => {}}
              onPause={() => {}}
            />
          </div>
        );

      case 'pdf':
        return (
          <div className="w-full h-96">
            <iframe
              src={fileUrl}
              className="w-full h-full rounded-lg border-0"
              title={file.name}
            />
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">Anteprima non disponibile per questo tipo di file</p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Apri in nuova pagina
            </button>
          </div>
        );
    }
  };

  return (
    <>
      <div className={`flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:bg-slate-700/70 transition-colors ${className}`}>
        <div className="flex-1 min-w-0 mr-3">
          <FilePreview file={file} />
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {showPreview && (fileType === 'image' || fileType === 'video' || fileType === 'audio' || fileType === 'pdf') && (
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="p-2 text-blue-400 hover:text-blue-300 transition-colors rounded hover:bg-blue-400/10 flex-shrink-0"
              title="Visualizza"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          )}
          
          {showDownload && fileUrl && (
            <button
              onClick={handleDownload}
              className="p-2 text-green-400 hover:text-green-300 transition-colors rounded hover:bg-green-400/10 flex-shrink-0"
              title="Apri in nuova pagina"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
          )}
          
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-2 text-red-400 hover:text-red-300 transition-colors rounded hover:bg-red-400/10 flex-shrink-0"
              title="Rimuovi"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-medium text-white">{file.name}</h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {renderPreview()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilePreviewDisplay;
