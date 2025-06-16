import React from 'react';
import { Card } from '../ui';
import type { AssetInfo } from '../../services/algorand';

interface AssetDescriptionProps {
  asset: AssetInfo;
}

const AssetDescription: React.FC<AssetDescriptionProps> = ({ asset }) => {
  const hasDescription = asset.params.name || asset.params.url;

  if (!hasDescription) {
    return (
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
        <p className="text-gray-500 italic">No description available for this asset.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
      <div className="space-y-4">
        {asset.params.name && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Asset Name</h4>
            <p className="text-gray-900">{asset.params.name}</p>
          </div>
        )}
        
        {asset.params.url && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">URL</h4>
            <a 
              href={asset.params.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {asset.params.url}
            </a>
          </div>
        )}
        
        {asset.params['metadata-hash'] && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Metadata Hash</h4>
            <p className="text-gray-900 font-mono text-sm break-all">
              {asset.params['metadata-hash']}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AssetDescription; 