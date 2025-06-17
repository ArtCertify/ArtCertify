import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CloudArrowUpIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import type { AssetInfo } from '../../services/algorand';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface ModifyAttachmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetInfo;
  currentAttachments?: Attachment[];
}

const ModifyAttachmentsModal: React.FC<ModifyAttachmentsModalProps> = ({
  isOpen,
  onClose,
  asset,
  currentAttachments = []
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: asset.nftMetadata?.name || asset.params.name || '',
    description: asset.nftMetadata?.description || asset.description || '',
    image: asset.nftMetadata?.image || '',
    licenseFile: null as File | null,
  });

  // Versioning info
  const [versionInfo, setVersionInfo] = useState({
    nextVersion: 1,
    previousVersion: {
      version: 0,
      cid: '',
      ipfsLink: ''
    }
  });

  const [attachments, setAttachments] = useState<Attachment[]>(currentAttachments);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  // Calculate versioning info on mount
  useEffect(() => {
    const versions = (asset.versioningInfo as any[]) || [];
    const latestVersion = versions.length > 0 
      ? Math.max(...versions.map(v => v.version || 0))
      : 0;
    
    const previousVersionData = versions.find(v => v.version === latestVersion);
    const currentCidInfo = asset.currentCidInfo as any;
    
    setVersionInfo({
      nextVersion: latestVersion + 1,
      previousVersion: {
        version: latestVersion,
        cid: previousVersionData?.cid || currentCidInfo?.cid || '',
        ipfsLink: previousVersionData?.gatewayUrl || currentCidInfo?.gatewayUrl || ''
      }
    });
  }, [asset]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        image: imageUrl
      }));
    }
  };

  const handleLicenseFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      setFormData(prev => ({
        ...prev,
        licenseFile: files[0]
      }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const newAttachment: Attachment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      };
      setAttachments(prev => [...prev, newAttachment]);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const truncateAddress = (address: string, startChars: number = 8, endChars: number = 8) => {
    if (address.length <= startChars + endChars) {
      return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      // Here you would typically:
      // 1. Upload files to IPFS
      // 2. Create new NFT metadata
      // 3. Submit transaction to Algorand blockchain
      // 4. Update asset configuration

      console.log('Saving asset modifications:', {
        assetId: asset.index,
        formData,
        attachments,
        versionInfo
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Close modal and show success
      onClose();
      // You would show a success notification here
      
    } catch (error) {
      console.error('Error saving modifications:', error);
      // Show error notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <Dialog.Title className="text-lg font-medium text-white">
              Modifica Certificazione - {asset.params.name || `Asset ${asset.index}`}
            </Dialog.Title>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-slate-400 hover:text-white disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Asset Basic Info */}
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-3">Informazioni Asset</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">ID Certificazione:</span>
                  <span className="ml-2 text-white font-mono">CERT-{asset.index}</span>
                </div>
                <div>
                  <span className="text-slate-400">Creatore:</span>
                  <span 
                    className="ml-2 text-white font-mono text-xs" 
                    title={asset.params.creator}
                  >
                    {truncateAddress(asset.params.creator)}
                  </span>
                </div>
              </div>
            </div>

            {/* Version Information */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
                <DocumentDuplicateIcon className="h-4 w-4" />
                Informazioni Versioning
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Nuova Versione:</span>
                  <span className="ml-2 text-white font-semibold">v{versionInfo.nextVersion}</span>
                </div>
                <div>
                  <span className="text-slate-400">Versione Precedente:</span>
                  <span className="ml-2 text-white">v{versionInfo.previousVersion.version}</span>
                </div>
                {versionInfo.previousVersion.cid && (
                  <div className="md:col-span-2">
                    <span className="text-slate-400">CID Precedente:</span>
                    <div className="mt-1 p-2 bg-slate-700 rounded text-xs font-mono text-slate-300 break-all">
                      {versionInfo.previousVersion.cid}
                    </div>
                    {versionInfo.previousVersion.ipfsLink && (
                      <a 
                        href={versionInfo.previousVersion.ipfsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs mt-1 inline-block"
                      >
                        Visualizza versione precedente su IPFS →
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div className="space-y-4">
                
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Nome Certificazione *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                    placeholder="Nome della certificazione"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Descrizione *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                    placeholder="Descrizione dettagliata della certificazione"
                    rows={4}
                    required
                  />
                </div>

                {/* License File */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    File Certificazione (Licenza) *
                  </label>
                  <div 
                    className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center hover:border-slate-500 transition-colors cursor-pointer"
                    onClick={() => licenseInputRef.current?.click()}
                  >
                    <CloudArrowUpIcon className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    {formData.licenseFile ? (
                      <div>
                        <p className="text-sm text-white font-medium">{formData.licenseFile.name}</p>
                        <p className="text-xs text-slate-400">{formatFileSize(formData.licenseFile.size)}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-slate-300">Clicca per caricare il file di certificazione</p>
                        <p className="text-xs text-slate-400">PDF, DOC, DOCX fino a 50MB</p>
                      </div>
                    )}
                    <input
                      ref={licenseInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleLicenseFileChange(e.target.files)}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                
                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Immagine Certificazione
                  </label>
                  <div 
                    className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center hover:border-slate-500 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.image ? (
                      <div className="space-y-2">
                        <img 
                          src={formData.image} 
                          alt="Preview" 
                          className="mx-auto h-32 w-32 object-cover rounded-lg"
                        />
                        <p className="text-xs text-slate-400">Clicca per cambiare immagine</p>
                      </div>
                    ) : (
                      <div>
                        <CloudArrowUpIcon className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-300">Clicca per caricare un'immagine</p>
                        <p className="text-xs text-slate-400">PNG, JPG, GIF fino a 10MB</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e.target.files)}
                    />
                  </div>
                </div>

                {/* Additional Attachments */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Allegati Aggiuntivi
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-900/20' 
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <CloudArrowUpIcon className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-300">Trascina file qui o clicca per caricare</p>
                    <p className="text-xs text-slate-400">Documenti di supporto, certificati, etc.</p>
                  </div>

                  {/* Attachments List */}
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-2 bg-slate-700 rounded"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{attachment.name}</p>
                            <p className="text-xs text-slate-400">{formatFileSize(attachment.size)}</p>
                          </div>
                          <button
                            onClick={() => removeAttachment(attachment.id)}
                            className="ml-2 p-1 text-red-400 hover:text-red-300"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-700">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annulla
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting || !formData.name.trim() || !formData.description.trim()}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Salvando v{versionInfo.nextVersion}...
                  </>
                ) : (
                  <>Crea Versione {versionInfo.nextVersion}</>
                )}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ModifyAttachmentsModal; 