import React from 'react';
import { CodeBracketIcon, HashtagIcon, ClockIcon, LinkIcon } from '@heroicons/react/24/outline';
import { Card } from '../ui';
import Badge from '../ui/Badge';
import { CidDecoder } from '../../services/cidDecoder';
import type { AssetInfo } from '../../services/algorand';

interface TechnicalMetadataProps {
  asset: AssetInfo;
}

const TechnicalMetadata: React.FC<TechnicalMetadataProps> = ({ asset }) => {
  const formatNumber = (num: number | bigint) => {
    return new Intl.NumberFormat().format(Number(num));
  };

  // Decodifica ARC-0019 del Reserve Address
  const reserveCidInfo = asset.params.reserve 
    ? CidDecoder.decodeReserveAddressToCid(asset.params.reserve)
    : null;

  const technicalData = [
    {
      label: 'Asset ID',
      value: asset.index.toString(),
      type: 'text'
    },
    {
      label: 'Total Supply',
      value: formatNumber(asset.params.total),
      type: 'number'
    },
    {
      label: 'Decimals',
      value: asset.params.decimals.toString(),
      type: 'number'
    },
    {
      label: 'Default Frozen',
      value: asset.params['default-frozen'],
      type: 'boolean'
    },
    {
      label: 'Created At Round',
      value: asset['created-at-round']?.toString() || 'N/A',
      type: 'text'
    }
  ];

  const addresses = [
    {
      label: 'Creator',
      value: asset.params.creator,
      required: true
    },
    {
      label: 'Manager',
      value: asset.params.manager,
      required: false
    },
    {
      label: 'Reserve',
      value: asset.params.reserve,
      required: false
    },
    {
      label: 'Freeze',
      value: asset.params.freeze,
      required: false
    },
    {
      label: 'Clawback',
      value: asset.params.clawback,
      required: false
    }
  ].filter(addr => addr.required || addr.value);

  return (
    <div className="space-y-6">
      {/* Technical Details */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Details</h3>
        <div className="space-y-3">
          {technicalData.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">{item.label}</span>
              <div className="text-right">
                {item.type === 'boolean' ? (
                  <Badge variant={item.value ? 'warning' : 'success'}>
                    {item.value ? 'Yes' : 'No'}
                  </Badge>
                ) : (
                  <span className="text-sm text-gray-900 font-mono">{item.value}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Addresses */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Addresses</h3>
        <div className="space-y-3">
          {addresses.map((addr, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-500">{addr.label}</span>
                {addr.required && (
                  <Badge variant="info" size="sm">Required</Badge>
                )}
              </div>
              <p className="text-xs font-mono text-gray-900 break-all bg-gray-50 p-2 rounded">
                {addr.value || 'Not set'}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* ARC-0019 CID Information */}
      {reserveCidInfo?.success && (
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ARC-0019 IPFS Information
            <Badge variant="success" size="sm" className="ml-2">Decoded</Badge>
          </h3>
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-500 block mb-1">CID v1</span>
              <p className="text-xs font-mono text-gray-900 break-all bg-gray-50 p-2 rounded">
                {reserveCidInfo.cid}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 block mb-1">Gateway URL</span>
              <a 
                href={reserveCidInfo.gatewayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-blue-600 hover:text-blue-800 break-all bg-blue-50 p-2 rounded block hover:bg-blue-100 transition-colors"
              >
                {reserveCidInfo.gatewayUrl}
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500 block mb-1">Version</span>
                <Badge variant="info">{reserveCidInfo.details?.version}</Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 block mb-1">Codec</span>
                <Badge variant="info">{reserveCidInfo.details?.codec}</Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 block mb-1">Hash Type</span>
                <Badge variant="info">{reserveCidInfo.details?.hashType}</Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 block mb-1">Standard</span>
                <Badge variant="success">ARC-0019</Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Asset Status */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Asset Status</span>
            <Badge variant="success">Active</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Frozen by Default</span>
            <Badge variant={asset.params['default-frozen'] ? 'warning' : 'success'}>
              {asset.params['default-frozen'] ? 'Frozen' : 'Unfrozen'}
            </Badge>
          </div>
          {asset.params.manager && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Manageable</span>
              <Badge variant="info">Yes</Badge>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TechnicalMetadata; 