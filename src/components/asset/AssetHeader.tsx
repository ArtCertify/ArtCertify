import React from 'react';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import Badge from '../ui/Badge';
import type { AssetInfo } from '../../services/algorand';

interface AssetHeaderProps {
  asset: AssetInfo;
}

const AssetHeader: React.FC<AssetHeaderProps> = ({ asset }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatNumber = (num: number | bigint) => {
    return new Intl.NumberFormat().format(Number(num));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {asset.params.name || `Asset ${asset.index}`}
            </h1>
            <Badge variant="info" className="ml-3">
              ASA
            </Badge>
          </div>
          
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className="font-medium">ID:</span>
              <span className="ml-1 font-mono">{asset.index}</span>
              <button
                onClick={() => copyToClipboard(asset.index.toString())}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                title="Copy Asset ID"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            </div>
            
            {asset.params.unitName && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span className="font-medium">Unit:</span>
                <span className="ml-1">{asset.params.unitName}</span>
              </div>
            )}
            
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className="font-medium">Total Supply:</span>
              <span className="ml-1">{formatNumber(asset.params.total)}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0">
          <div className="flex space-x-3">
            <Badge variant={asset.params.defaultFrozen ? 'warning' : 'success'}>
              {asset.params.defaultFrozen ? 'Frozen' : 'Active'}
            </Badge>
            {asset.params.decimals > 0 && (
              <Badge variant="default">
                {asset.params.decimals} decimals
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetHeader; 