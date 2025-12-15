import React from 'react';
import { DocumentDuplicateIcon, LinkIcon } from '@heroicons/react/24/outline';

interface InfoCardProps {
  title: string;
  value?: string | React.ReactNode;
  icon?: React.ReactNode;
  copyable?: boolean;
  copyValue?: string;
  externalUrl?: string;
  className?: string;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  value,
  icon,
  copyable = false,
  copyValue,
  externalUrl,
  className = '',
  fullWidth = false,
  children
}) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Failed to copy to clipboard
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const textToCopy = copyValue || (typeof value === 'string' ? value : '');

  return (
    <div className={`${fullWidth ? 'col-span-full' : ''} ${className}`}>
      <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
        {icon}
        {title}
      </label>
      <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
        {children || (
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {typeof value === 'string' ? (
                <p className="text-slate-300 text-sm font-mono break-words overflow-wrap-anywhere">
                  {value}
                </p>
              ) : (
                value
              )}
            </div>
            
            {(copyable || externalUrl) && (
              <div className="flex items-center gap-2 ml-3">
                {copyable && textToCopy && (
                  <button
                    onClick={() => copyToClipboard(textToCopy)}
                    className="p-1.5 hover:bg-slate-600 rounded text-slate-400 hover:text-white transition-colors"
                    title="Copia negli appunti"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </button>
                )}
                {externalUrl && (
                  <button
                    onClick={() => openInNewTab(externalUrl)}
                    className="p-1.5 hover:bg-slate-600 rounded text-slate-400 hover:text-white transition-colors"
                    title="Apri in nuova scheda"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoCard; 