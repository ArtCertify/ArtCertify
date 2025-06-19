import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ResponsiveLayout from './layout/ResponsiveLayout';
import { ErrorMessage, AssetDetailsSkeleton, SectionCard, DataGrid, StatusBadge } from './ui';
import { VersioningSection } from './VersioningSection';
import ModifyAttachmentsModal from './modals/ModifyAttachmentsModal';
import { algorandService } from '../services/algorand';
import { useAsyncState } from '../hooks/useAsyncState';
import type { AssetInfo } from '../services/algorand';

const AssetDetailsPage: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const { data: asset, loading, error, execute } = useAsyncState<AssetInfo>();
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);

  // Require asset ID in URL
  const targetAssetId = assetId;

  useEffect(() => {
    if (!targetAssetId) {
      return;
    }

    execute(() => algorandService.getAssetInfo(targetAssetId));
  }, [targetAssetId, execute]);

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) {
      return 'Non disponibile';
    }
    
    // Algorand timestamps are in seconds, JavaScript Date expects milliseconds
    const date = new Date(timestamp * 1000);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Data non valida';
    }
    
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatHash = (hash?: string): string => {
    if (!hash) return 'Non disponibile';
    return hash;
  };

  if (loading) {
    return (
      <ResponsiveLayout title="Caricamento...">
        <AssetDetailsSkeleton />
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <ErrorMessage 
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </ResponsiveLayout>
    );
  }

  if (!asset) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <ErrorMessage message="Asset not found" />
        </div>
      </ResponsiveLayout>
    );
  }

  // Get creation date from creation transaction
  const creationTransaction = asset.creationTransaction as any;
  let creationDate = creationTransaction?.roundTime || creationTransaction?.['round-time'] || creationTransaction?.confirmedRound || creationTransaction?.['confirmed-round'];
  
  // Fallback: use asset creation round if transaction date not available
  if (!creationDate && asset['created-at-round']) {
    // Convert round to approximate timestamp (Algorand genesis + round * 4.5 seconds)
    const algorandGenesis = 1560211200; // June 10, 2019 UTC
    const avgBlockTime = 4.5; // seconds
    creationDate = algorandGenesis + (asset['created-at-round'] * avgBlockTime);
  }
  
  // Get last modification date from the most recent config transaction
  const versioningInfo = asset.versioningInfo as any[];
  const lastConfigDate = versioningInfo && versioningInfo.length > 0 
    ? versioningInfo[versioningInfo.length - 1].timestamp
    : creationDate;

  return (
    <ResponsiveLayout title="Dettagli Certificazione">
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <StatusBadge
            status="success"
            label="Certificato"
            variant="dot"
          />
          <button 
            onClick={() => setIsModifyModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Modifica Allegati
          </button>
        </div>

        {/* Asset Information */}
        <SectionCard title="Informazioni Certificazione">
          <DataGrid
            columns={3}
            fields={[
              {
                key: 'id',
                label: 'ID Certificazione',
                value: `CERT-${asset.index}`
              },
              {
                key: 'creation',
                label: 'Data Creazione',
                value: formatDate(creationDate)
              },
              {
                key: 'modified',
                label: 'Ultima Modifica',
                value: formatDate(lastConfigDate)
              },
              {
                key: 'hash',
                label: 'Hash Blockchain (Transazione di Creazione)',
                value: (asset.creationTransaction as any)?.id || 'Non disponibile',
                copyable: true,
                fullWidth: true
              },
              {
                key: 'creator',
                label: 'Autore (Creatore)',
                value: asset.params.creator,
                copyable: true,
                fullWidth: true
              }
            ]}
          />
        </SectionCard>

        {/* Descrizione Section */}
        <SectionCard title="Descrizione">
          <p className="text-slate-300 leading-relaxed text-sm">
            {asset.description || 'Nessuna descrizione disponibile'}
          </p>
        </SectionCard>

        {/* NFT Metadata e Versioning Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - NFT Metadata Section */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Metadata NFT</h3>
            
            {/* NFT Metadata Display */}
            {asset.nftMetadata && Object.keys(asset.nftMetadata).length > 0 ? (
              <div className="space-y-4">
                {/* Name */}
                {asset.nftMetadata.name && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Nome:</p>
                    <p className="text-sm text-slate-300 bg-slate-700 p-2 rounded">
                      {asset.nftMetadata.name}
                    </p>
                  </div>
                )}

                {/* Description */}
                {asset.nftMetadata.description && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Descrizione:</p>
                    <p className="text-sm text-slate-300 bg-slate-700 p-2 rounded">
                      {asset.nftMetadata.description}
                    </p>
                  </div>
                )}

                {/* Image */}
                {asset.nftMetadata.image && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Immagine:</p>
                    <div className="bg-slate-700 p-2 rounded">
                      <p className="text-xs text-slate-300 break-all mb-2">{asset.nftMetadata.image}</p>
                      <a 
                        href={asset.nftMetadata.image} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Visualizza Immagine →
                      </a>
                    </div>
                  </div>
                )}

                {/* External URL */}
                {asset.nftMetadata.external_url && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">URL Esterno:</p>
                    <div className="bg-slate-700 p-2 rounded">
                      <p className="text-xs text-slate-300 break-all mb-2">{asset.nftMetadata.external_url}</p>
                      <a 
                        href={asset.nftMetadata.external_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Apri Link →
                      </a>
                    </div>
                  </div>
                )}

                {/* Attributes */}
                {asset.nftMetadata.attributes && asset.nftMetadata.attributes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">Attributi:</p>
                    <div className="bg-slate-700 p-3 rounded space-y-2">
                      {asset.nftMetadata.attributes.map((attr, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">{attr.trait_type}:</span>
                          <span className="text-xs text-slate-300 font-medium">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CID Info */}
                {asset.currentCidInfo && (asset.currentCidInfo as any).success && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">CID IPFS (Metadata):</p>
                    <div className="bg-slate-700 p-2 rounded">
                      <a 
                        href={(asset.currentCidInfo as any).gatewayUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-mono text-xs break-all underline"
                        title="Clicca per visualizzare metadata su IPFS"
                      >
                        {(asset.currentCidInfo as any).cid}
                      </a>
                    </div>
                  </div>
                )}

                {/* Individual IPFS Files */}
                {asset.nftMetadata?.properties?.files_metadata && Array.isArray(asset.nftMetadata.properties.files_metadata) && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">File IPFS:</p>
                    <div className="bg-slate-700 p-3 rounded space-y-3">
                      {(asset.nftMetadata.properties.files_metadata as any[]).map((file, index) => (
                        <div key={index} className="border-b border-slate-600 last:border-b-0 pb-2 last:pb-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-300 font-medium">{file.name}</span>
                            <div className="flex gap-2">
                              <a 
                                href={file.ipfsUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:text-blue-300 underline"
                                title="Apri con IPFS"
                              >
                                IPFS
                              </a>
                              <a 
                                href={file.gatewayUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-green-400 hover:text-green-300 underline"
                                title="Apri con Gateway"
                              >
                                Gateway
                              </a>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 font-mono break-all">
                            {file.ipfsUrl?.replace('ipfs://', '')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certification Data Files (fallback) */}
                {asset.nftMetadata?.certification_data?.files && Array.isArray(asset.nftMetadata.certification_data.files) && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">File Certificazione:</p>
                    <div className="bg-slate-700 p-3 rounded space-y-2">
                      {asset.nftMetadata.certification_data.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-300">{file.name}</span>
                            <span className="text-xs text-slate-500 ml-2">({file.type})</span>
                          </div>
                          <div className="flex gap-2">
                            <a 
                              href={`ipfs://${file.hash}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 underline"
                              title="Apri con IPFS"
                            >
                              IPFS
                            </a>
                            <a 
                              href={`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${file.hash}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-green-400 hover:text-green-300 underline"
                              title="Apri con Gateway"
                            >
                              Gateway
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-700 p-4 rounded">
                <p className="text-slate-400 text-sm">Nessun metadata NFT disponibile</p>
                {/* Fallback: mostra CID se disponibile */}
                {asset.currentCidInfo && (asset.currentCidInfo as any).success ? (
                  <div className="mt-3">
                    <p className="text-xs text-slate-500 mb-1">CID IPFS:</p>
                    <a 
                      href={(asset.currentCidInfo as any).gatewayUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-mono text-xs break-all underline"
                      title="Clicca per visualizzare su IPFS"
                    >
                      {(asset.currentCidInfo as any).cid}
                    </a>
                  </div>
                ) : asset.params.reserve && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-500 mb-1">Reserve Address:</p>
                    <p className="text-xs text-slate-400 font-mono break-all">
                      {asset.params.reserve}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Versioning Section */}
          <div>
            <VersioningSection 
              versioningInfo={asset.versioningInfo as any[]} 
              loading={loading}
            />
          </div>
        </div>

        {/* Metadati Tecnici Section */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Metadati Tecnici</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Asset ID */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Asset ID
              </label>
              <div className="bg-slate-700 rounded p-3">
                <p className="text-white font-mono text-sm">
                  {asset.index}
                </p>
              </div>
            </div>

            {/* Total Supply */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Supply Totale
              </label>
              <div className="bg-slate-700 rounded p-3">
                <p className="text-white text-sm">{asset.params.total.toString()}</p>
              </div>
            </div>

            {/* Metadata Hash - Full Width */}
            {asset.params.metadataHash && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Metadata Hash
                </label>
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-white font-mono text-sm break-all">
                    {formatHash(
                      typeof asset.params.metadataHash === 'string' 
                        ? asset.params.metadataHash 
                        : asset.params.metadataHash 
                          ? Array.from(new Uint8Array(asset.params.metadataHash))
                              .map(b => b.toString(16).padStart(2, '0'))
                              .join('')
                          : undefined
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Unit Name */}
            {asset.params.unitName && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Unit Name
                </label>
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-white text-sm">{asset.params.unitName}</p>
                </div>
              </div>
            )}

            {/* Decimals */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Decimali
              </label>
              <div className="bg-slate-700 rounded p-3">
                <p className="text-white text-sm">{asset.params.decimals}</p>
              </div>
            </div>

            {/* Explorer Links */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Collegamenti Explorer
              </label>
              <div className="bg-slate-700 rounded p-3 space-y-2">
                <a 
                  href={algorandService.getAssetExplorerUrl(asset.index.toString())} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-blue-400 hover:text-blue-300 text-sm"
                >
                  Visualizza Asset su Explorer →
                </a>
                <a 
                  href={algorandService.getAddressExplorerUrl(asset.params.creator)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-blue-400 hover:text-blue-300 text-sm"
                >
                  Visualizza Creatore su Explorer →
                </a>
                {(asset.creationTransaction as any)?.id && (
                  <a 
                    href={algorandService.getTransactionExplorerUrl((asset.creationTransaction as any).id)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Visualizza Transazione di Creazione →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modify Attachments Modal */}
      {asset && (
        <ModifyAttachmentsModal
          isOpen={isModifyModalOpen}
          onClose={() => setIsModifyModalOpen(false)}
          asset={asset}
        />
      )}
    </ResponsiveLayout>
  );
};

export default AssetDetailsPage; 