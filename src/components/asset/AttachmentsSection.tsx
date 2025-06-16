import React, { useState, useEffect } from 'react';
import { PlusIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Card, Button, LoadingSpinner } from '../ui';
import ModifyAttachmentsModal from '../modals/ModifyAttachmentsModal';
import { CidDecoder } from '../../services/cidDecoder';
import type { AssetInfo } from '../../services/algorand';

interface AttachmentsSectionProps {
  asset: AssetInfo;
}

const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({ asset }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract real attachments from asset metadata
  const attachments = [];
  
  // Add asset URL as an attachment if it exists
  if (asset.params.url) {
    attachments.push({
      id: 'asset-url',
      name: 'Asset URL',
      type: 'text/url',
      size: asset.params.url.length,
      url: asset.params.url
    });
  }
  
  // Add metadata hash as attachment if it exists
  if (asset.params.metadataHash) {
    attachments.push({
      id: 'metadata-hash',
      name: 'Metadata Hash',
      type: 'text/hash',
      size: 32, // SHA-256 hash size
      url: `#${asset.params.metadataHash}`
    });
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <PhotoIcon className="h-5 w-5 text-blue-500" />;
    }
    return <DocumentIcon className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Attachments</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Attachment
          </button>
        </div>

        {attachments.length > 0 ? (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  {getFileIcon(attachment.type)}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(attachment.size)}</p>
                  </div>
                </div>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No attachments</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding an attachment.</p>
          </div>
        )}
      </Card>

      <ModifyAttachmentsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assetId={asset.index.toString()}
        currentAttachments={attachments}
      />
    </>
  );
};

export default AttachmentsSection; 