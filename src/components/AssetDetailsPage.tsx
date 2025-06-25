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
  DocumentDuplicateIcon,
  ClockIcon,
  TagIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import ResponsiveLayout from './layout/ResponsiveLayout';
import { 
  ErrorMessage, 
  AssetDetailsSkeleton, 
  StatusBadge,
  InfoCard,
  IPFSFileCard,
  VersionCard,
  TabsContainer
} from './ui';
import ModifyAttachmentsModal from './modals/ModifyAttachmentsModal';
import { algorandService } from '../services/algorand';
import { useAsyncState } from '../hooks/useAsyncState';
import type { AssetInfo } from '../services/algorand';

const AssetDetailsPage: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const { data: asset, loading, error, execute } = useAsyncState<AssetInfo>();
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('certificate');
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set());

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

  // Helper function to determine certification type
  const getCertificationType = () => {
    if (!asset) return 'Documento';
    
    // 1. Try certification_data.asset_type (metodo principale)
    if (asset.nftMetadata?.certification_data?.asset_type) {
      const assetType = asset.nftMetadata.certification_data.asset_type.toLowerCase();
      if (assetType === 'document') return 'Documento';
      // Tutti i tipi di artefatto vengono mappati ad "Artefatto"
      if (assetType.includes('artefatto') || assetType === 'artifact' || 
          assetType === 'video' || assetType === 'modello-3d' || 
          assetType === 'artefatto-digitale' || assetType === 'altro') {
        return 'Artefatto';
      }
    }

    // 2. Try attributes "Asset Type" trait
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

    // 3. Fallback to name (for backward compatibility)
    if (asset.params.name) {
      const name = asset.params.name.toLowerCase();
      if (name.includes('document') || name.includes('doc')) return 'Documento';
      if (name.includes('artefatto') || name.includes('artifact') || 
          name.includes('video') || name.includes('modello') || 
          name.includes('sbt')) return 'Artefatto';
    }

    // 4. Default intelligente basato su unit name
    if (asset.params.unitName) {
      const unitName = asset.params.unitName.toLowerCase();
      if (unitName.includes('doc')) return 'Documento';
      if (unitName.includes('art') || unitName.includes('sbt') || unitName.includes('cert')) return 'Artefatto';
    }

    // 5. Default fallback
    return 'Documento';
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
          <ErrorMessage message="Asset non trovato" />
        </div>
      </ResponsiveLayout>
    );
  }

  // Get creation date from creation transaction
  const creationTransaction = asset.creationTransaction as any;
  let creationDate = creationTransaction?.roundTime || creationTransaction?.['round-time'] || creationTransaction?.confirmedRound || creationTransaction?.['confirmed-round'];
  
  // Fallback: use asset creation round if transaction date not available
  if (!creationDate && asset['created-at-round']) {
    const algorandGenesis = 1560211200; // June 10, 2019 UTC
    const avgBlockTime = 4.5; // seconds
    creationDate = algorandGenesis + (asset['created-at-round'] * avgBlockTime);
  }
  
  // Get versioning info and sort by timestamp (most recent first)
  const versioningInfo = asset.versioningInfo as any[];
  const sortedVersioningInfo = versioningInfo ? [...versioningInfo].sort((a, b) => {
    const timestampA = a.timestamp || 0;
    const timestampB = b.timestamp || 0;
    return timestampB - timestampA; // Descending order (most recent first)
  }) : [];
  
  const lastConfigDate = sortedVersioningInfo && sortedVersioningInfo.length > 0 
    ? sortedVersioningInfo[0].timestamp
    : creationDate;

  // Process IPFS files
  const processIPFSFiles = () => {
    const files: any[] = [];
    
    if (asset.nftMetadata?.image) {
      files.push({
        name: 'Immagine Principale',
        type: 'image/*',
        src: asset.nftMetadata.image,
        hash: asset.nftMetadata.image.replace('ipfs://', ''),
        category: 'image'
      });
    }

    if (asset.nftMetadata?.properties?.files && Array.isArray(asset.nftMetadata.properties.files)) {
      asset.nftMetadata.properties.files.forEach((file: any, index: number) => {
        files.push({
          name: file.name || `File ${index + 1}`,
          type: file.type || file.mimetype,
          size: file.size,
          src: file.src,
          hash: file.src?.replace('ipfs://', ''),
          category: 'attachment'
        });
      });
    }

    return files;
  };

  const ipfsFiles = processIPFSFiles();

  return (
    <ResponsiveLayout title="Dettagli Certificazione">
      <div className="space-y-8">
        
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
            Modifica Allegati
          </button>
        </div>

        {/* Enhanced Asset Title Section - Streamlined */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                {asset.nftMetadata?.name || asset.params.name || `Asset ${asset.index}`}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-blue-900/30 text-blue-400 text-xs font-medium px-2 py-1 rounded-md border border-blue-800">
                  ID: {asset.index}
                </span>
                <span className="bg-slate-600 text-slate-300 text-xs font-medium px-2 py-1 rounded-md">
                  {asset.params.unitName || 'NFT'}
                </span>
                {/* Certification Type Badge */}
                <span className="bg-emerald-900/30 text-emerald-400 text-xs font-medium px-2 py-1 rounded-md border border-emerald-800">
                  {getCertificationType()}
                </span>
              </div>
              
              {/* Compact Header Information */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  <button
                    onClick={() => openInNewTab(algorandService.getAddressExplorerUrl(asset.params.creator))}
                    className="text-blue-400 hover:text-blue-300 font-mono transition-colors"
                    title="Visualizza su explorer"
                  >
                    {truncateAddress(asset.params.creator)}
                  </button>
                </div>
                
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>{formatDate(creationDate)}</span>
                </div>
                
                {sortedVersioningInfo && sortedVersioningInfo.length > 0 && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    <span>{sortedVersioningInfo.length} {sortedVersioningInfo.length === 1 ? 'versione' : 'versioni'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Description - More compact */}
          {(asset.nftMetadata?.description || asset.description) && (
            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/50">
              <p className="text-slate-300 text-sm leading-relaxed">
                {asset.nftMetadata?.description || asset.description}
              </p>
            </div>
          )}
        </div>

        {/* Tabs Container */}
        <TabsContainer
          tabs={[
            {
              id: 'certificate',
              label: 'Informazioni Certificato',
              content: (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                    
                    {/* Left Column - Primary Information (3/4 width) */}
                    <div className="xl:col-span-3 space-y-4">
                      
                      {/* Certificate Details Card - Streamlined */}
                      <div className="bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-600/50">
                          <DocumentTextIcon className="h-4 w-4 text-blue-400" />
                          <h3 className="text-sm font-semibold text-white">Informazioni Generali</h3>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InfoCard
                              title="ID Certificazione"
                              value={`CERT-${asset.index}`}
                              icon={<HashtagIcon className="h-3 w-3" />}
                              copyable
                            />
                            <InfoCard
                              title="Nome Asset"
                              value={asset.params.name || 'Non specificato'}
                              icon={<CubeIcon className="h-3 w-3" />}
                              copyable
                            />
                            <InfoCard
                              title="Data Creazione"
                              value={formatDate(creationDate)}
                              icon={<CalendarIcon className="h-3 w-3" />}
                            />
                            <InfoCard
                              title="Ultima Modifica"
                              value={formatDate(lastConfigDate)}
                              icon={<ClockIcon className="h-3 w-3" />}
                            />
                          </div>
                        </div>
                      </div>

                      {/* NFT Metadata Card - Compact */}
                      {asset.nftMetadata && Object.keys(asset.nftMetadata).length > 0 && (
                        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
                          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-600/50">
                            <CubeIcon className="h-4 w-4 text-purple-400" />
                            <h3 className="text-sm font-semibold text-white">Metadati NFT</h3>
                          </div>
                          <div className="p-4 space-y-3">
                            {asset.nftMetadata.name && (
                              <InfoCard
                                title="Nome NFT"
                                value={asset.nftMetadata.name}
                                copyable
                              />
                            )}
                            
                            {(asset.nftMetadata.description && asset.nftMetadata.description !== asset.params.unitName) && (
                              <InfoCard
                                title="Descrizione NFT"
                                value={asset.nftMetadata.description}
                                fullWidth
                              />
                            )}
                            
                            {/* Fallback: usa technical_specs.description se disponibile */}
                            {(!asset.nftMetadata.description || asset.nftMetadata.description === asset.params.unitName) && 
                             asset.nftMetadata.certification_data?.technical_specs?.description && (
                              <InfoCard
                                title="Descrizione NFT"
                                value={asset.nftMetadata.certification_data.technical_specs.description}
                                fullWidth
                              />
                            )}
                            
                            {asset.nftMetadata.external_url && (
                              <InfoCard
                                title="URL Esterno"
                                value={asset.nftMetadata.external_url}
                                externalUrl={asset.nftMetadata.external_url}
                                copyable
                                fullWidth
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {/* IPFS Files Card - Streamlined */}
                      {ipfsFiles.length > 0 && (
                        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-600/50">
                            <div className="flex items-center gap-2">
                              <PhotoIcon className="h-4 w-4 text-green-400" />
                              <h3 className="text-sm font-semibold text-white">File IPFS</h3>
                            </div>
                            <span className="bg-green-900/30 text-green-400 text-xs font-medium px-2 py-1 rounded border border-green-800">
                              {ipfsFiles.length}
                            </span>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {ipfsFiles.map((file, index) => (
                                <IPFSFileCard
                                  key={file.cid || file.name || `file-${index}`}
                                  file={file}
                                  index={index}
                                  showPreview={file.category === 'image'}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Compact Actions & Technical (1/4 width) */}
                    <div className="space-y-4">
                      
                      {/* Quick Actions Card - Compact */}
                      <div className="bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-600/50">
                          <LinkIcon className="h-4 w-4 text-blue-400" />
                          <h3 className="text-sm font-semibold text-white">Azioni</h3>
                        </div>
                        <div className="p-3 space-y-2">
                          <button
                            onClick={() => openInNewTab(algorandService.getAssetExplorerUrl(asset.index))}
                            className="w-full text-left p-2 bg-blue-900/20 hover:bg-blue-900/30 rounded border border-blue-800/30 hover:border-blue-700 transition-colors group"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium text-white">Esplora Asset</p>
                                <p className="text-xs text-slate-400">Pera Explorer</p>
                              </div>
                              <LinkIcon className="h-3 w-3 text-blue-400" />
                            </div>
                          </button>
                          
                          <button
                            onClick={() => openInNewTab(algorandService.getAddressExplorerUrl(asset.params.creator))}
                            className="w-full text-left p-2 bg-purple-900/20 hover:bg-purple-900/30 rounded border border-purple-800/30 hover:border-purple-700 transition-colors group"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium text-white">Creatore</p>
                                <p className="text-xs text-slate-400 font-mono">{truncateAddress(asset.params.creator, 6, 4)}</p>
                              </div>
                              <UserIcon className="h-3 w-3 text-purple-400" />
                            </div>
                          </button>

                          {(creationTransaction as any)?.id && (
                            <button
                              onClick={() => openInNewTab(algorandService.getTransactionExplorerUrl((creationTransaction as any).id || ''))}
                              className="w-full text-left p-2 bg-green-900/20 hover:bg-green-900/30 rounded border border-green-800/30 hover:border-green-700 transition-colors group"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-white">Transazione</p>
                                  <p className="text-xs text-slate-400 font-mono">{truncateAddress((creationTransaction as any).id || '', 6, 4)}</p>
                                </div>
                                <DocumentDuplicateIcon className="h-3 w-3 text-green-400" />
                              </div>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Technical Details Card - Compact */}
                      <div className="bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-600/50">
                          <GlobeAltIcon className="h-4 w-4 text-slate-400" />
                          <h3 className="text-sm font-semibold text-white">Specifiche</h3>
                        </div>
                        <div className="p-3 space-y-2">
                          <div className="grid grid-cols-1 gap-4">
                            <InfoCard
                              title="Creatore"
                              value={truncateAddress(asset.params.creator)}
                              copyValue={asset.params.creator}
                              copyable={true}
                              icon={<UserIcon className="h-4 w-4" />}
                              externalUrl={algorandService.getAddressExplorerUrl(asset.params.creator)}
                            />
                            <InfoCard
                              title="Unità"
                              value={asset.params.unitName || 'N/A'}
                              icon={<TagIcon className="h-4 w-4" />}
                            />
                            <InfoCard
                              title="Decimali"
                              value={asset.params.decimals?.toString() || '0'}
                              icon={<HashtagIcon className="h-4 w-4" />}
                            />
                            <InfoCard
                              title="Tipo"
                              value={getCertificationType()}
                              icon={<DocumentIcon className="h-4 w-4" />}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              id: 'versioning',
              label: 'Versioning',
              content: (
                <div className="space-y-8">
                  
                  {/* Versioning Header */}
                  <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl border border-indigo-800/30 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                          <ClockIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Storia delle Versioni</h3>
                          <p className="text-indigo-300 text-sm">Cronologia completa delle modifiche</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{sortedVersioningInfo.length}</p>
                        <p className="text-indigo-300 text-sm">{sortedVersioningInfo.length === 1 ? 'versione' : 'versioni'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Versioning Content */}
                  {sortedVersioningInfo.length > 0 ? (
                    <div className="space-y-6">
                      {/* Timeline Indicator */}
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span>Ordinamento: dalla più recente alla più vecchia</span>
                      </div>
                      
                      {/* Versions List */}
                      <div className="space-y-4">
                        {sortedVersioningInfo.map((version, index) => {
                          // Determine if this version is current based on reserve address
                          const isCurrentVersion = version.reserveAddress === asset.params.reserve;
                          // Create a unique key using version.id or fallback to version.transactionId or index
                          const uniqueKey = version.id || version.transactionId || `version-${index}`;
                          
                          return (
                            <div key={uniqueKey} className="flex gap-4">
                              {/* Timeline Column */}
                              <div className="flex flex-col items-center flex-shrink-0">
                                {/* Version Dot */}
                                <div className={`w-3 h-3 rounded-full border-2 ${
                                  isCurrentVersion 
                                    ? 'bg-green-500 border-green-400' 
                                    : 'bg-indigo-500 border-indigo-400'
                                }`}></div>
                                
                                {/* Timeline Line */}
                                {index < sortedVersioningInfo.length - 1 && (
                                  <div className="w-0.5 h-full min-h-[80px] bg-gradient-to-b from-indigo-500/50 to-transparent mt-2"></div>
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
                      <div className="mt-8 p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <DocumentTextIcon className="h-4 w-4 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white mb-2">Informazioni sul Versioning</h4>
                            <div className="text-xs text-slate-400 space-y-1">
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
                    /* Enhanced Empty State */
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ClockIcon className="h-12 w-12 text-slate-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Nessuna Versione Disponibile</h3>
                      <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        Questo asset non ha ancora versioni registrate. Le versioni vengono create quando vengono apportate modifiche ai metadati dell'asset.
                      </p>
                      <div className="bg-slate-800/50 rounded-lg p-4 max-w-lg mx-auto border border-slate-700">
                        <p className="text-sm text-slate-300 mb-2">💡 <strong>Suggerimento:</strong></p>
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

                 {/* Modify Attachments Modal */}
         {isModifyModalOpen && (
           <ModifyAttachmentsModal
             isOpen={isModifyModalOpen}
             onClose={() => setIsModifyModalOpen(false)}
             asset={asset}
             onAssetUpdated={() => {
               // Ricarica i dati dell'asset dopo l'aggiornamento
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