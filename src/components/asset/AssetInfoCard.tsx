import React from 'react';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { Card } from '../ui';
import type { AssetInfo } from '../../services/algorand';

interface AssetInfoCardProps {
  asset: AssetInfo;
}

const AssetInfoCard: React.FC<AssetInfoCardProps> = ({ asset }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (address: string) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const infoItems = [
    {
      label: 'Creator',
      value: asset.params.creator,
      copyable: true,
      formatted: formatAddress(asset.params.creator)
    },
    {
      label: 'Manager',
      value: asset.params.manager || 'N/A',
      copyable: !!asset.params.manager,
      formatted: asset.params.manager ? formatAddress(asset.params.manager) : 'N/A'
    },
    {
      label: 'Reserve',
      value: asset.params.reserve || 'N/A',
      copyable: !!asset.params.reserve,
      formatted: asset.params.reserve ? formatAddress(asset.params.reserve) : 'N/A'
    },
    {
      label: 'Freeze',
      value: asset.params.freeze || 'N/A',
      copyable: !!asset.params.freeze,
      formatted: asset.params.freeze ? formatAddress(asset.params.freeze) : 'N/A'
    },
    {
      label: 'Clawback',
      value: asset.params.clawback || 'N/A',
      copyable: !!asset.params.clawback,
      formatted: asset.params.clawback ? formatAddress(asset.params.clawback) : 'N/A'
    }
  ];

  return (
    <Card>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Asset Information</h3>
      <div className="space-y-4">
        {infoItems.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-500">{item.label}</span>
            <div className="flex items-center">
              <span className="text-sm text-gray-900 font-mono">{item.formatted}</span>
              {item.copyable && item.value !== 'N/A' && (
                <button
                  onClick={() => copyToClipboard(item.value)}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  title={`Copy ${item.label}`}
                >
                  <ClipboardDocumentIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AssetInfoCard; 