import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ResponsiveLayout from './layout/ResponsiveLayout';
import ErrorMessage from './ui/ErrorMessage';
import { AssetDetailsSkeleton } from './ui/AssetDetailsSkeleton';
import { VersioningSection } from './VersioningSection';
import { algorandService } from '../services/algorand';
import { config } from '../config/environment';
import type { AssetInfo } from '../services/algorand';

const AssetDetailsPage: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const [asset, setAsset] = useState<AssetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default asset ID if none provided in URL (from environment config)
  const targetAssetId = assetId || config.defaultAssetId;

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);
        setError(null);
        const assetData = await algorandService.getAssetInfo(targetAssetId);
        setAsset(assetData);
      } catch (err) {
        console.error('Error fetching asset:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch asset information');
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [targetAssetId]);

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
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {asset.params.name || `Asset ${asset.index}`}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800">
              Documento
            </span>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            Modifica Allegati
          </button>
        </div>

        {/* Main Content - Full Width */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ID Certificazione */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                ID Certificazione
              </label>
              <div className="bg-slate-700 rounded p-3">
                <p className="text-white text-sm">CERT-{asset.index}</p>
              </div>
            </div>

            {/* Data Creazione */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Data Creazione
              </label>
              <div className="bg-slate-700 rounded p-3">
                <p className="text-white text-sm">{formatDate(creationDate)}</p>
              </div>
            </div>

            {/* Stato */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Stato
              </label>
              <div className="bg-slate-700 rounded p-3">
                <span className="inline-flex items-center text-sm text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Certificato
                </span>
              </div>
            </div>

            {/* Hash Blockchain - Full Width */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Hash Blockchain (Transazione di Creazione)
              </label>
              <div className="bg-slate-700 rounded p-3">
                <p className="text-white font-mono text-sm break-all">
                  {asset.creationTransaction?.id || 'Non disponibile'}
                </p>
              </div>
            </div>

            {/* Autore - Full Width */}
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Autore (Creatore)
              </label>
              <div className="bg-slate-700 rounded p-3">
                <p className="text-white text-sm font-mono break-all">{asset.params.creator}</p>
              </div>
            </div>

            {/* Ultima Modifica */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Ultima Modifica
              </label>
              <div className="bg-slate-700 rounded p-3">
                <p className="text-white text-sm">{formatDate(lastConfigDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Descrizione Section */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Descrizione</h3>
          <p className="text-slate-300 leading-relaxed text-sm">
            {asset.description || 'Nessuna descrizione disponibile'}
          </p>
        </div>

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
                {asset.currentCidInfo && asset.currentCidInfo.success && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">CID IPFS:</p>
                    <div className="bg-slate-700 p-2 rounded">
                      <a 
                        href={asset.currentCidInfo.gatewayUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-mono text-xs break-all underline"
                        title="Clicca per visualizzare su IPFS"
                      >
                        {asset.currentCidInfo.cid}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-700 p-4 rounded">
                <p className="text-slate-400 text-sm">Nessun metadata NFT disponibile</p>
                {/* Fallback: mostra CID se disponibile */}
                {asset.currentCidInfo && asset.currentCidInfo.success ? (
                  <div className="mt-3">
                    <p className="text-xs text-slate-500 mb-1">CID IPFS:</p>
                    <a 
                      href={asset.currentCidInfo.gatewayUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-mono text-xs break-all underline"
                      title="Clicca per visualizzare su IPFS"
                    >
                      {asset.currentCidInfo.cid}
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
                    {formatHash(asset.params.metadataHash)}
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
                {asset.creationTransaction?.id && (
                  <a 
                    href={algorandService.getTransactionExplorerUrl(asset.creationTransaction.id)} 
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
    </ResponsiveLayout>
  );
};

export default AssetDetailsPage; 