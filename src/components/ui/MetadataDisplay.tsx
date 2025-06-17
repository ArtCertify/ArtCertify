import React from 'react';
import SectionCard from './SectionCard';
import InfoField from './InfoField';

interface MetadataAttribute {
  trait_type: string;
  value: string | number;
}

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  external_url?: string;
  attributes?: MetadataAttribute[];
}

interface MetadataDisplayProps {
  metadata: NFTMetadata | null;
  cidInfo?: {
    success: boolean;
    cid: string;
    gatewayUrl: string;
  };
  title?: string;
  emptyMessage?: string;
}

const MetadataDisplay: React.FC<MetadataDisplayProps> = ({
  metadata,
  cidInfo,
  title = "Metadata NFT",
  emptyMessage = "Nessun metadata NFT disponibile"
}) => {
  const hasMetadata = metadata && Object.keys(metadata).length > 0;

  const renderAttributes = () => {
    if (!metadata?.attributes || metadata.attributes.length === 0) return null;

    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-400 mb-2">Attributi:</p>
        <div className="bg-slate-700 p-3 rounded space-y-2">
          {metadata.attributes.map((attr, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-xs text-slate-400">{attr.trait_type}:</span>
              <span className="text-xs text-slate-300 font-medium">{attr.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCidInfo = () => {
    if (!cidInfo?.success) return null;

    return (
      <InfoField
        label="CID IPFS"
        value={
          <a 
            href={cidInfo.gatewayUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-mono text-xs break-all underline"
            title="Clicca per visualizzare su IPFS"
          >
            {cidInfo.cid}
          </a>
        }
        variant="compact"
      />
    );
  };

  return (
    <SectionCard title={title}>
      {hasMetadata ? (
        <div className="space-y-4">
          {/* Name */}
          {metadata.name && (
            <InfoField
              label="Nome"
              value={metadata.name}
              variant="compact"
            />
          )}

          {/* Description */}
          {metadata.description && (
            <InfoField
              label="Descrizione"
              value={metadata.description}
              variant="compact"
            />
          )}

          {/* Image */}
          {metadata.image && (
            <InfoField
              label="Immagine"
              value={
                <div>
                  <p className="text-xs text-slate-300 break-all mb-2">{metadata.image}</p>
                  <a 
                    href={metadata.image} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Visualizza Immagine →
                  </a>
                </div>
              }
              variant="compact"
            />
          )}

          {/* External URL */}
          {metadata.external_url && (
            <InfoField
              label="URL Esterno"
              value={
                <div>
                  <p className="text-xs text-slate-300 break-all mb-2">{metadata.external_url}</p>
                  <a 
                    href={metadata.external_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Apri Link →
                  </a>
                </div>
              }
              variant="compact"
            />
          )}

          {/* Attributes */}
          {renderAttributes()}

          {/* CID Info */}
          {renderCidInfo()}
        </div>
      ) : (
        <div className="bg-slate-700 p-4 rounded">
          <p className="text-slate-400 text-sm">{emptyMessage}</p>
          {renderCidInfo()}
        </div>
      )}
    </SectionCard>
  );
};

export default MetadataDisplay; 