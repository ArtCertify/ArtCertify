import React from 'react';
import {
  DocumentIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  ArchiveBoxIcon,
  CodeBracketIcon,
  PresentationChartBarIcon,
  TableCellsIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface FilePreviewProps {
  file: File | { name: string; type: string; size?: number; url?: string };
  className?: string;
  showSize?: boolean;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  className = '',
  showSize = true,
  showName = true,
  size = 'md'
}) => {
  const getFileType = (fileName: string, mimeType: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // Image types
    if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif'].includes(extension)) {
      return 'image';
    }
    
    // Video types
    if (mimeType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp', 'ogv'].includes(extension)) {
      return 'video';
    }
    
    // Audio types
    if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'].includes(extension)) {
      return 'audio';
    }
    
    // Document types
    if (mimeType === 'application/pdf' || extension === 'pdf') {
      return 'pdf';
    }
    
    if (['doc', 'docx'].includes(extension)) {
      return 'word';
    }
    
    if (['xls', 'xlsx'].includes(extension)) {
      return 'excel';
    }
    
    if (['ppt', 'pptx'].includes(extension)) {
      return 'powerpoint';
    }
    
    if (['txt', 'rtf', 'odt'].includes(extension)) {
      return 'text';
    }
    
    // Archive types
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(extension)) {
      return 'archive';
    }
    
    // Code types
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'sass', 'less', 'json', 'xml', 'yaml', 'yml', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt'].includes(extension)) {
      return 'code';
    }
    
    // Database types
    if (['sql', 'db', 'sqlite', 'mdb', 'accdb'].includes(extension)) {
      return 'database';
    }
    
    // 3D/CAD types
    if (['obj', 'fbx', 'dae', '3ds', 'blend', 'max', 'ma', 'mb'].includes(extension)) {
      return '3d';
    }
    
    // Font types
    if (['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(extension)) {
      return 'font';
    }
    
    // Executable types
    if (['exe', 'msi', 'dmg', 'pkg', 'deb', 'rpm', 'app'].includes(extension)) {
      return 'executable';
    }
    
    // Default
    return 'unknown';
  };

  const getFileIcon = (fileType: string) => {
    const iconClass = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8';
    
    switch (fileType) {
      case 'image':
        return <PhotoIcon className={`${iconClass} text-blue-400`} />;
      case 'video':
        return <VideoCameraIcon className={`${iconClass} text-purple-400`} />;
      case 'audio':
        return <MusicalNoteIcon className={`${iconClass} text-green-400`} />;
      case 'pdf':
        return <DocumentTextIcon className={`${iconClass} text-red-400`} />;
      case 'word':
        return <DocumentTextIcon className={`${iconClass} text-blue-500`} />;
      case 'excel':
        return <TableCellsIcon className={`${iconClass} text-green-500`} />;
      case 'powerpoint':
        return <PresentationChartBarIcon className={`${iconClass} text-orange-500`} />;
      case 'text':
        return <DocumentTextIcon className={`${iconClass} text-gray-400`} />;
      case 'archive':
        return <ArchiveBoxIcon className={`${iconClass} text-yellow-500`} />;
      case 'code':
        return <CodeBracketIcon className={`${iconClass} text-indigo-400`} />;
      case 'database':
        return <CpuChipIcon className={`${iconClass} text-cyan-400`} />;
      case '3d':
        return <CpuChipIcon className={`${iconClass} text-pink-400`} />;
      case 'font':
        return <DocumentTextIcon className={`${iconClass} text-teal-400`} />;
      case 'executable':
        return <CpuChipIcon className={`${iconClass} text-red-500`} />;
      default:
        return <DocumentIcon className={`${iconClass} text-slate-400`} />;
    }
  };

  const getFileTypeLabel = (fileType: string) => {
    switch (fileType) {
      case 'image': return 'Immagine';
      case 'video': return 'Video';
      case 'audio': return 'Audio';
      case 'pdf': return 'PDF';
      case 'word': return 'Word';
      case 'excel': return 'Excel';
      case 'powerpoint': return 'PowerPoint';
      case 'text': return 'Testo';
      case 'archive': return 'Archivio';
      case 'code': return 'Codice';
      case 'database': return 'Database';
      case '3d': return '3D/CAD';
      case 'font': return 'Font';
      case 'executable': return 'Eseguibile';
      default: return 'File';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fileType = getFileType(file.name, file.type);
  const fileSize = (file as any).size || 0;

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center gap-3 ${sizeClasses[size]} ${className}`}>
      <div className="flex-shrink-0">
        {getFileIcon(fileType)}
      </div>
      <div className="min-w-0 flex-1">
        {showName && (
          <p className={`${textSizeClasses[size]} text-white font-medium truncate`} title={file.name}>
            {file.name}
          </p>
        )}
        <div className="flex items-center gap-2 text-slate-400">
          <span className={`${textSizeClasses[size]} text-slate-400`}>
            {getFileTypeLabel(fileType)}
          </span>
          {showSize && fileSize > 0 && (
            <>
              <span className="text-slate-500">•</span>
              <span className={`${textSizeClasses[size]} text-slate-400`}>
                {formatFileSize(fileSize)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;