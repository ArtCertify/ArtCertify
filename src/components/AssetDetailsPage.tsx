import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PencilIcon,
  DocumentTextIcon,
  CubeIcon,
  UserIcon,
  CalendarIcon,
  HashtagIcon,
  LinkIcon,
  GlobeAltIcon,
  PhotoIcon,
  ClockIcon,
  TagIcon,
  DocumentIcon,
  CheckBadgeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import ResponsiveLayout from './layout/ResponsiveLayout';
import { 
  ErrorMessage, 
  AssetDetailsSkeleton, 
  StatusBadge,
  InfoCard,
  VersionCard,
  TabsContainer
} from './ui';
import ModifyAttachmentsModal from './modals/ModifyAttachmentsModal';
import { algorandService } from '../services/algorand';
import { IPFSUrlService } from '../services/ipfsUrlService';
import { useAsyncState } from '../hooks/useAsyncState';
import { useIPFSMetadata } from '../hooks/useIPFSMetadata';
import { FilePreview } from './ui';
import type { AssetInfo } from '../services/algorand';

const AssetDetailsPage: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const { data: asset, loading, error, execute } = useAsyncState<AssetInfo>();
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('certificate');
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set());
  const [creationDate, setCreationDate] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  
  // Carica i metadati IPFS dal CID del JSON (dal reserve address)
  const [jsonCid, setJsonCid] = useState<string | undefined>(undefined);
  const { metadata: ipfsMetadata, loading: metadataLoading, error: metadataError } = useIPFSMetadata(jsonCid);

  // Estrai il CID del JSON dal reserve address
  React.useEffect(() => {
    if (asset?.params?.reserve) {
      const result = IPFSUrlService.getReserveAddressUrl(asset.params.reserve);
      if (result.success && result.cid) {
        setJsonCid(result.cid);
      }
    }
  }, [asset?.params?.reserve]);

  // Require asset ID in URL
  const targetAssetId = assetId;

  useEffect(() => {
    if (!targetAssetId) {
      return;
    }

    execute(() => algorandService.getAssetInfo(targetAssetId));
  }, [targetAssetId, execute]);

  // Fetch creation date when asset is loaded
  useEffect(() => {
    if (asset && asset['created-at-round']) {
      const fetchCreationDate = async () => {
        try {
          const timestamp = await algorandService.getBlockTimestamp(Number(asset['created-at-round']));
          if (timestamp) {
            const date = new Date(timestamp * 1000);
            setCreationDate(date.toLocaleString('it-IT', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }));
          } else {
            // Fallback calculation
            const algorandGenesis = 1622505600; // June 1, 2021 00:00:00 UTC
            const avgBlockTime = 4.5; // seconds
            const fallbackTimestamp = algorandGenesis + ((asset['created-at-round'] || 0) * avgBlockTime);
            const date = new Date(fallbackTimestamp * 1000);
            setCreationDate(date.toLocaleString('it-IT', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }));
          }
        } catch (error) {
          console.error('Error fetching block timestamp:', error);
          // Fallback calculation
          const algorandGenesis = 1622505600;
          const avgBlockTime = 4.5;
          const fallbackTimestamp = algorandGenesis + ((asset['created-at-round'] || 0) * avgBlockTime);
          const date = new Date(fallbackTimestamp * 1000);
          setCreationDate(date.toLocaleString('it-IT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }));
        }
      };
      
      fetchCreationDate();
    }
  }, [asset]);


  const truncateAddress = (address: string, start = 8, end = 8) => {
    if (address.length <= start + end) return address;
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleVersionExpansion = (versionId: number) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(versionId)) {
        newSet.delete(versionId);
      } else {
        newSet.add(versionId);
      }
      return newSet;
    });
  };

  // Helper function to determine certification type from IPFS metadata first
  const getCertificationType = () => {
    // Priorità ai dati IPFS
    if (ipfsMetadata?.properties?.form_data?.type) {
      return ipfsMetadata.properties.form_data.type;
    }

    if (!asset) return 'Documento';
    
    if (asset.nftMetadata?.certification_data?.asset_type) {
      const assetType = asset.nftMetadata.certification_data.asset_type.toLowerCase();
      if (assetType === 'document') return 'Documento';
      if (assetType.includes('artefatto') || assetType === 'artifact' || 
          assetType === 'video' || assetType === 'modello-3d' || 
          assetType === 'artefatto-digitale' || assetType === 'altro') {
        return 'Artefatto';
      }
    }

    if (asset.nftMetadata?.attributes) {
      const assetTypeAttr = asset.nftMetadata.attributes.find(
        attr => attr.trait_type === 'Asset Type' || attr.trait_type === 'Tipo Certificazione'
      );
      if (assetTypeAttr) {
        const value = String(assetTypeAttr.value).toLowerCase();
        if (value === 'document' || value === 'documento') return 'Documento';
        if (value.includes('artefatto') || value === 'artifact' || 
            value === 'video' || value === 'modello-3d' || 
            value === 'artefatto-digitale' || value === 'altro') {
          return 'Artefatto';
        }
      }
    }

    if (asset.params.name) {
      const name = asset.params.name.toLowerCase();
      if (name.includes('document') || name.includes('doc')) return 'Documento';
      if (name.includes('artefatto') || name.includes('artifact') || 
          name.includes('video') || name.includes('modello') || 
          name.includes('sbt')) return 'Artefatto';
    }

    if (asset.params.unitName) {
      const unitName = asset.params.unitName.toLowerCase();
      if (unitName.includes('doc')) return 'Documento';
      if (unitName.includes('art') || unitName.includes('sbt') || unitName.includes('cert')) return 'Artefatto';
    }

    return 'Documento';
  };

  // Get display name prioritizing IPFS metadata
  const getDisplayName = () => {
    return ipfsMetadata?.name || 
           ipfsMetadata?.properties?.form_data?.fullAssetName ||
           asset?.params?.name || 
           `Asset ${asset?.index}`;
  };

  // Get display description prioritizing IPFS metadata
  const getDisplayDescription = () => {
    return ipfsMetadata?.description || 
           ipfsMetadata?.properties?.form_data?.description ||
           asset?.nftMetadata?.description || 
           asset?.description ||
           '';
  };

  // Get main image URL from IPFS metadata
  const getMainImageUrl = () => {
    if (ipfsMetadata?.image) {
      const hash = ipfsMetadata.image.replace('ipfs://', '');
      return IPFSUrlService.getGatewayUrl(hash);
    }
    if (ipfsMetadata?.properties?.files_metadata?.[0]?.gatewayUrl) {
      return ipfsMetadata.properties.files_metadata[0].gatewayUrl;
    }
    return null;
  };

  if (loading) {
    return (
      <ResponsiveLayout>
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
          <ErrorMessage message="Asset non trovato" />
        </div>
      </ResponsiveLayout>
    );
  }

  // Get versioning info and sort by timestamp (most recent first)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const versioningInfo = (asset.versioningInfo as any[]) || [];
  const sortedVersioningInfo = versioningInfo.length > 0 ? [...versioningInfo].sort((a, b) => {
    const timestampA = a.timestamp || 0;
    const timestampB = b.timestamp || 0;
    return timestampB - timestampA;
  }) : [];

  return (
    <ResponsiveLayout>
      <div className="space-y-4 sm:space-y-6 pb-24">
        
        {/* Header with Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
              title="Torna alla Dashboard"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <StatusBadge
                status="success"
                label="Certificato"
                variant="dot"
              />
            </div>
          </div>
          
          <button 
            onClick={() => setIsModifyModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors w-full sm:w-auto"
          >
            <PencilIcon className="h-4 w-4" />
            Modifica Allegati
          </button>
        </div>

        {/* Modern Asset Card with Image - IPFS Powered */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors">
          <div className="flex flex-col md:flex-row lg:grid lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            
            {/* Left: Image Preview */}
            <div className="md:flex-1 lg:col-span-1 bg-slate-900/50 p-3 sm:p-4 lg:p-6 flex items-center justify-center">
              {metadataLoading ? (
                <div className="w-full aspect-square bg-slate-700/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
                    <p className="text-slate-400 text-sm">Caricamento immagine...</p>
                  </div>
                </div>
              ) : getMainImageUrl() && !imageError ? (
                <div className="w-full">
                  <img
                    src={getMainImageUrl()!}
                    alt={getDisplayName()}
                    className="w-full aspect-square object-cover rounded-lg shadow-lg"
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="w-full aspect-square bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-slate-700">
                  <div className="text-center">
                    <PhotoIcon className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Nessuna anteprima</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Asset Information */}
            <div className="md:flex-1 lg:col-span-2 p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col gap-4 mb-4 lg:mb-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckBadgeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="space-y-0.5">
                          <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
                            {ipfsMetadata?.properties?.form_data?.assetName || 'Nome Certificazione'}
                          </h2>
                          <p className="text-slate-300 text-sm">
                            {ipfsMetadata?.properties?.form_data?.projectName || 'Nome Progetto'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-blue-900/30 text-blue-400 text-xs font-medium px-2 py-1 rounded-md border border-blue-800">
                        {getCertificationType()}
                      </span>
                      <span className="bg-slate-600 text-slate-300 text-xs font-medium px-2 py-1 rounded-md">
                        {ipfsMetadata?.properties?.form_data?.unitName || asset.params.unitName || 'NFT'}
                      </span>
                    </div>
                  </div>
                </div>
              
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <HashtagIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-400">Asset ID</span>
                      </div>
                      <p className="text-sm font-semibold text-white break-all">{asset.index}</p>
                    </div>
                    
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-400">Data Creazione</span>
                      </div>
                      <p className="text-sm font-medium text-white">
                        {ipfsMetadata?.properties?.form_data?.fileCreationDate 
                          ? new Date(ipfsMetadata.properties.form_data.fileCreationDate).toLocaleDateString('it-IT')
                          : creationDate || 'Caricamento...'}
                      </p>
                    </div>
                    
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <LinkIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-400">Metadati IPFS</span>
                      </div>
                      <button
                        onClick={async () => {
                          if (asset.params.reserve) {
                            const result = await IPFSUrlService.getReserveAddressUrl(asset.params.reserve);
                            if (result.success && result.gatewayUrl) {
                              window.open(result.gatewayUrl, '_blank', 'noopener,noreferrer');
                            }
                          }
                        }}
                        className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors break-words"
                      >
                        Visualizza JSON
                      </button>
                    </div>
                </div>
                
                {/* Description */}
                {getDisplayDescription() && (
                  <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/50">
                    <div className="flex items-start gap-2 mb-2">
                      <InformationCircleIcon className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <h3 className="text-sm font-medium text-slate-300">Descrizione</h3>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {getDisplayDescription()}
                    </p>
                  </div>
                )}

                {/* IPFS Status Badge */}
                {ipfsMetadata && (
                  <div className="flex items-center gap-1.5 bg-green-900/20 text-green-400 px-2 py-1 rounded border border-green-800 inline-flex text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Dati caricati da IPFS</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Container */}
        <div className="w-full">
          <TabsContainer
            tabs={[
              {
                id: 'certificate',
                label: 'Informazioni Certificato',
                content: (
                <div className="space-y-4">
                      
                      {/* Algorand Chain Information */}
                      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                            <GlobeAltIcon className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-white">Informazioni Algorand Chain</h3>
                            <p className="text-slate-400 text-xs">Dati dalla blockchain</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                          <InfoCard
                            title="Asset ID"
                            value={asset.index.toString()}
                            icon={<HashtagIcon className="h-4 w-4" />}
                            copyable
                            externalUrl={algorandService.getAssetExplorerUrl(asset.index)}
                          />
                          <InfoCard
                            title="Unit Name"
                            value={asset.params.unitName || 'Non specificato'}
                            icon={<TagIcon className="h-4 w-4" />}
                            copyable
                          />
                          <InfoCard
                            title="Reserve Address"
                            value={asset.params.reserve ? truncateAddress(asset.params.reserve) : 'Non specificato'}
                            copyValue={asset.params.reserve}
                            icon={<LinkIcon className="h-4 w-4" />}
                            copyable={!!asset.params.reserve}
                          />
                          <InfoCard
                            title="Totale Supply"
                            value={asset.params.total.toString()}
                            icon={<CubeIcon className="h-4 w-4" />}
                          />
                          <button
                            onClick={() => openInNewTab(algorandService.getAssetExplorerUrl(asset.index))}
                            className="w-full text-left p-2 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg border border-blue-800/30 hover:border-blue-700 transition-colors group sm:col-span-2 xl:col-span-1"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-white">Esplora Asset</p>
                                <p className="text-xs text-slate-400">Pera Explorer</p>
                              </div>
                              <LinkIcon className="h-4 w-4 text-blue-400" />
                            </div>
                          </button>
                          
                          <button
                            onClick={() => openInNewTab(algorandService.getAddressExplorerUrl(asset.params.creator))}
                            className="w-full text-left p-2 bg-purple-900/20 hover:bg-purple-900/30 rounded-lg border border-purple-800/30 hover:border-purple-700 transition-colors group sm:col-span-2 xl:col-span-1"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-white">Creatore</p>
                                <p className="text-xs text-slate-400 font-mono">{truncateAddress(asset.params.creator, 6, 4)}</p>
                              </div>
                              <UserIcon className="h-4 w-4 text-purple-400" />
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Certification Information from IPFS */}
                      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <CheckBadgeIcon className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-white">Informazioni Certificazione</h3>
                            <p className="text-slate-400 text-xs">Dati dalla certificazione IPFS</p>
                          </div>
                        </div>

                        {ipfsMetadata?.properties?.form_data ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                          <InfoCard
                              title="Progetto"
                              value={ipfsMetadata.properties.form_data.projectName || 'Non specificato'}
                            icon={<TagIcon className="h-4 w-4" />}
                          />
                          <InfoCard
                              title="Nome Asset"
                              value={ipfsMetadata.properties.form_data.assetName || 'Non specificato'}
                              icon={<CubeIcon className="h-4 w-4" />}
                          />
                          <InfoCard
                            title="Tipo"
                              value={ipfsMetadata.properties.form_data.type || ipfsMetadata.properties.form_data.customType || 'Non specificato'}
                              icon={<TagIcon className="h-4 w-4" />}
                            />
                            <InfoCard
                              title="Data Creazione File"
                              value={ipfsMetadata.properties.form_data.fileCreationDate 
                                ? new Date(ipfsMetadata.properties.form_data.fileCreationDate).toLocaleString('it-IT')
                                : 'Non disponibile'}
                              icon={<CalendarIcon className="h-4 w-4" />}
                            />
                            <InfoCard
                              title="Origine File"
                              value={ipfsMetadata.properties.form_data.fileOrigin || 'Non specificato'}
                              icon={<DocumentIcon className="h-4 w-4" />}
                            />
                            <InfoCard
                              title="Nome File"
                              value={ipfsMetadata.properties.form_data.fileName || 'Non specificato'}
                              icon={<DocumentIcon className="h-4 w-4" />}
                              copyable
                            />
                            <InfoCard
                              title="Tipo File"
                              value={ipfsMetadata.properties.form_data.fileType || 'Non specificato'}
                              icon={<DocumentIcon className="h-4 w-4" />}
                            />
                            <InfoCard
                              title="Dimensione File"
                              value={ipfsMetadata.properties.form_data.fileSize 
                                ? `${(ipfsMetadata.properties.form_data.fileSize / 1024).toFixed(2)} KB`
                                : 'Non disponibile'}
                              icon={<DocumentIcon className="h-4 w-4" />}
                            />
                            <InfoCard
                              title="Estensione"
                              value={ipfsMetadata.properties.form_data.fileExtension || 'Non specificato'}
                            icon={<DocumentIcon className="h-4 w-4" />}
                          />
                            <InfoCard
                              title="Timestamp Upload"
                              value={ipfsMetadata.properties.form_data.timestamp 
                                ? new Date(ipfsMetadata.properties.form_data.timestamp).toLocaleString('it-IT')
                                : 'Non disponibile'}
                              icon={<ClockIcon className="h-4 w-4" />}
                            />
                            {ipfsMetadata.properties?.ipfs_info && (
                              <>
                                <InfoCard
                                  title="Gateway IPFS"
                                  value={ipfsMetadata.properties.ipfs_info.gateway}
                                  icon={<GlobeAltIcon className="h-4 w-4" />}
                                  copyable
                                  fullWidth
                                />
                                <InfoCard
                                  title="CID Metadati JSON"
                                  value={jsonCid || 'Non disponibile'}
                                  icon={<HashtagIcon className="h-4 w-4" />}
                                  copyable
                                  fullWidth
                                />
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                              <InformationCircleIcon className="w-8 h-8 text-slate-500" />
                            </div>
                            <p className="text-slate-400 text-sm">
                              {metadataLoading ? 'Caricamento dati IPFS...' : 'Dati IPFS non disponibili'}
                            </p>
                            {metadataError && (
                              <p className="text-red-400 text-xs mt-2">{metadataError}</p>
                            )}
                          </div>
                        )}
                      </div>


                      {/* File Preview Card - IPFS Powered */}
                      {ipfsMetadata?.properties?.files_metadata && ipfsMetadata.properties.files_metadata.length > 0 ? (
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                <PhotoIcon className="w-3 h-3 text-white" />
                              </div>
                              <div>
                                <h3 className="text-base font-semibold text-white">File Certificato</h3>
                                <p className="text-slate-400 text-xs">File originali caricati su IPFS</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-green-900/30 text-green-400 text-xs font-medium px-2 py-1 rounded border border-green-800">
                                {ipfsMetadata.properties.files_metadata.length} {ipfsMetadata.properties.files_metadata.length === 1 ? 'file' : 'file'}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ipfsMetadata.properties.files_metadata.map((file, index) => (
                              <FilePreview
                                key={`${file.ipfsUrl}-${index}`}
                                fileName={file.name}
                                fileType={ipfsMetadata.properties?.form_data?.fileType || 'application/octet-stream'}
                                fileSize={ipfsMetadata.properties?.form_data?.fileSize || 0}
                                gatewayUrl={file.gatewayUrl}
                                ipfsUrl={file.ipfsUrl}
                              />
                            ))}
                          </div>
                        </div>
                      ) : !metadataLoading && (
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                              <PhotoIcon className="w-3 h-3 text-white" />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-white">File Certificato</h3>
                              <p className="text-slate-400 text-xs">Nessun file disponibile dai metadati IPFS</p>
                      </div>
                    </div>
                          <div className="text-center py-6">
                            <div className="w-12 h-12 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-3">
                              <PhotoIcon className="w-6 h-6 text-slate-500" />
                            </div>
                            <p className="text-slate-400 text-sm mb-2">
                              Nessun file trovato nei metadati IPFS
                            </p>
                            <p className="text-slate-500 text-xs">
                              I file potrebbero non essere stati caricati correttamente o i metadati potrebbero essere incompleti
                            </p>
                    </div>
                  </div>
                      )}
                </div>
              )
            },
            {
              id: 'versioning',
              label: 'Versioning',
              content: (
                <div className="space-y-4">
                  
                  {/* Versioning Header */}
                  <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl border border-indigo-800/30 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                          <ClockIcon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white">Storia delle Versioni</h3>
                          <p className="text-indigo-300 text-xs">Cronologia completa delle modifiche</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">{sortedVersioningInfo.length}</p>
                        <p className="text-indigo-300 text-xs">{sortedVersioningInfo.length === 1 ? 'versione' : 'versioni'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Versioning Content */}
                  {sortedVersioningInfo.length > 0 ? (
                    <div className="space-y-4">
                      {/* Timeline Indicator */}
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span>Ordinamento: dalla più recente alla più vecchia</span>
                      </div>
                      
                      {/* Versions List */}
                      <div className="space-y-3">
                        {sortedVersioningInfo.map((version, index) => {
                          const isCurrentVersion = version.reserveAddress === asset.params.reserve;
                          const uniqueKey = version.id || version.transactionId || `version-${index}`;
                          
                          return (
                            <div key={uniqueKey} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                              {/* Timeline Column */}
                              <div className="flex flex-row sm:flex-col items-start sm:items-center flex-shrink-0">
                                <div className={`w-3 h-3 rounded-full border-2 ${
                                  isCurrentVersion 
                                    ? 'bg-green-500 border-green-400' 
                                    : 'bg-indigo-500 border-indigo-400'
                                }`}></div>
                                
                                {index < sortedVersioningInfo.length - 1 && (
                                  <div className="w-0.5 h-8 sm:h-full sm:min-h-[80px] bg-gradient-to-b sm:bg-gradient-to-b from-indigo-500/50 to-transparent mt-2 sm:mt-2"></div>
                                )}
                              </div>
                              
                              {/* Version Card */}
                              <div className="flex-1">
                                <VersionCard
                                  version={version}
                                  isLatest={isCurrentVersion}
                                  isExpanded={expandedVersions.has(version.id || index)}
                                  onToggle={() => toggleVersionExpansion(version.id || index)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Footer Info */}
                      <div className="mt-4 p-3 sm:p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                        <div className="flex flex-col sm:flex-row items-start gap-2">
                          <div className="w-6 h-6 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <DocumentTextIcon className="h-3 w-3 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xs font-medium text-white mb-1">Informazioni sul Versioning</h4>
                            <div className="text-xs text-slate-400 space-y-0.5">
                              <p>• Le versioni sono ordinate dalla più recente alla più vecchia</p>
                              <p>• Ogni versione rappresenta una modifica ai metadati dell'asset registrata su blockchain</p>
                              <p>• I file IPFS sono immutabili e identificati univocamente dal loro CID (Content Identifier)</p>
                              <p>• Puoi accedere ai file tramite diversi gateway IPFS per garantire la disponibilità</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClockIcon className="h-8 w-8 text-slate-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Nessuna Versione Disponibile</h3>
                      <p className="text-slate-400 mb-4 max-w-md mx-auto text-sm">
                        Questo asset non ha ancora versioni registrate. Le versioni vengono create quando vengono apportate modifiche ai metadati dell'asset.
                      </p>
                      <div className="bg-slate-800/50 rounded-lg p-3 max-w-lg mx-auto border border-slate-700">
                        <p className="text-xs text-slate-300 mb-1">💡 <strong>Suggerimento:</strong></p>
                        <p className="text-xs text-slate-400">
                          Utilizza il pulsante "Modifica Allegati" per aggiornare i file IPFS associati a questo asset e creare una nuova versione.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            }
          ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="pills"
            responsive={true}
          />
        </div>

        {/* Modify Attachments Modal */}
        {isModifyModalOpen && (
          <ModifyAttachmentsModal
            isOpen={isModifyModalOpen}
            onClose={() => setIsModifyModalOpen(false)}
            asset={asset}
            ipfsMetadata={ipfsMetadata || undefined}
            onAssetUpdated={() => {
              if (targetAssetId) {
                execute(() => algorandService.getAssetInfo(targetAssetId));
              }
            }}
          />
        )}

      </div>
    </ResponsiveLayout>
  );
};

export default AssetDetailsPage;