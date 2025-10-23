import React, { useState, useEffect } from 'react';
import { FormLayout } from '../ui';
import { OrganizationData } from '../ui';
import { CertificationModal } from '../modals/CertificationModal';
import { usePeraCertificationFlow } from '../../hooks/usePeraCertificationFlow';
import { Input, Button, Alert, FileUpload } from '../ui';
import { 
  TrashIcon, 
  ArrowPathIcon, 
  DocumentIcon, 
  FolderIcon,
  VideoCameraIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

interface CertificationFormProps {
  onBack: () => void;
}

interface CertificationFormData {
  // File metadata (auto-generated, read-only)
  fileName: string;
  fileSize: number;
  fileType: string;
  fileExtension: string;
  fileCreationDate: string;
  
  // User input fields
  projectName: string;           // Max 10 caratteri
  assetName: string;            // Max 19 caratteri
  unitName: string;             // Auto-generated: "PROJ-ASSET" (max 8 chars)
  fullAssetName: string;        // Auto-generated: "ProjectName / AssetName" (max 32)
  description: string;          // Max 300 caratteri
  fileOrigin: string;           // Max 100 caratteri, optional
  type: string;                 // Dropdown selection + custom option
  customType: string;           // Custom type when "altro" is selected
}

const TYPE_OPTIONS = [
  { value: 'documento', label: 'Documento' },
  { value: 'immagine', label: 'Immagine' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'modello-3d', label: 'Modello 3D' },
  { value: 'codice', label: 'Codice' },
  { value: 'altro', label: 'Altro' }
];

export const CertificationForm: React.FC<CertificationFormProps> = ({ onBack }) => {
  // Certification flow hook
  const {
    isModalOpen,
    isProcessing,
    result: mintResult,
    steps,
    startCertificationFlow,
    retryStep,
    closeModal,
    isWalletConnected,
    walletAddress
  } = usePeraCertificationFlow();

  // Organization data state
  const [organizationData, setOrganizationData] = useState({
    name: 'Museo Arte',
    code: 'MA001',
    type: 'Museo',
    city: 'Roma'
  });

  // Form data state
  const [formData, setFormData] = useState<CertificationFormData>({
    fileName: '',
    fileSize: 0,
    fileType: '',
    fileExtension: '',
    fileCreationDate: '',
    projectName: '',
    assetName: '',
    unitName: '',
    fullAssetName: '',
    description: '',
    fileOrigin: '',
    type: 'documento',
    customType: ''
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video' | 'audio' | 'document' | 'other'>('other');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  // const [submitSuccess, setSubmitSuccess] = useState(false);

  // Auto-generate unit name and full asset name
  useEffect(() => {
    if (formData.projectName && formData.assetName) {
      // Generate unit name (max 8 chars): first 3 of project + "-" + first 4 of asset
      const projectShort = formData.projectName.substring(0, 3).toUpperCase();
      const assetShort = formData.assetName.substring(0, 4).toUpperCase();
      const unitName = `${projectShort}-${assetShort}`.substring(0, 8);
      
      // Generate full asset name (max 32 chars): "ProjectName / AssetName"
      // Remove any special characters that might cause issues
      const cleanProjectName = formData.projectName.replace(/[^a-zA-Z0-9\s]/g, '');
      const cleanAssetName = formData.assetName.replace(/[^a-zA-Z0-9\s]/g, '');
      const fullAssetName = `${cleanProjectName} / ${cleanAssetName}`.substring(0, 32);
      
      setFormData(prev => ({
        ...prev,
        unitName,
        fullAssetName
      }));
    }
  }, [formData.projectName, formData.assetName]);

  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      
      // Check file size (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        setSubmitError('Il file deve essere inferiore a 20MB');
        return;
      }
      
      // Extract file metadata
      const fileName = file.name;
      const fileSize = file.size;
      const fileType = file.type;
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const fileCreationDate = new Date(file.lastModified).toISOString().split('T')[0];
      
      // Determine preview type and generate preview
      const previewType = getPreviewType(fileType, fileExtension);
      setPreviewType(previewType);
      
      // Generate preview URL
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
      
      // Store the actual file
      setUploadedFile(file);
      
      setFormData(prev => ({
        ...prev,
        fileName,
        fileSize,
        fileType,
        fileExtension,
        fileCreationDate
      }));
      
      setSubmitError(null);
    }
  };

  // Determine preview type based on file type and extension
  const getPreviewType = (fileType: string, fileExtension: string): 'image' | 'video' | 'audio' | 'document' | 'other' => {
    // Image types
    if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension)) {
      return 'image';
    }
    
    // Video types
    if (fileType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(fileExtension)) {
      return 'video';
    }
    
    // Audio types
    if (fileType.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(fileExtension)) {
      return 'audio';
    }
    
    // Document types
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text') || 
        ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(fileExtension)) {
      return 'document';
    }
    
    return 'other';
  };

  // Handle input changes
  const handleInputChange = (field: keyof CertificationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setSubmitError(null);
  };

  // Handle organization data update
  const handleOrganizationUpdate = (data: typeof organizationData) => {
    setOrganizationData(data);
  };

  // Validate form
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!uploadedFile) errors.push('File è obbligatorio');
    if (!formData.projectName.trim()) errors.push('Nome Progetto è obbligatorio');
    if (formData.projectName.length > 10) errors.push('Nome Progetto deve essere massimo 10 caratteri');
    if (!formData.assetName.trim()) errors.push('Nome Asset è obbligatorio');
    if (formData.assetName.length > 19) errors.push('Nome Asset deve essere massimo 19 caratteri');
    if (formData.fullAssetName.length > 32) errors.push('Nome Asset completo deve essere massimo 32 caratteri');
    if (formData.unitName.length > 8) errors.push('Unit Name deve essere massimo 8 caratteri');
    if (!formData.description.trim()) errors.push('Descrizione è obbligatoria');
    if (formData.description.length > 300) errors.push('Descrizione deve essere massimo 300 caratteri');
    if (!formData.type) errors.push('Tipo è obbligatorio');
    if (formData.type === 'altro' && !formData.customType.trim()) errors.push('Specifica il tipo personalizzato');
    if (formData.fileOrigin.length > 100) errors.push('Origine del file deve essere massimo 100 caratteri');
    
    if (!isWalletConnected || !walletAddress) {
      errors.push('Pera Wallet non connesso. Effettua il login prima di procedere.');
    }

    return { isValid: errors.length === 0, errors };
  };

  // Prepare certification data for IPFS
  const prepareCertificationData = () => {
    const finalType = formData.type === 'altro' ? formData.customType : formData.type;
    
    return {
      asset_type: finalType,
      unique_id: `${formData.projectName}_${formData.assetName}_${Date.now()}`,
      title: formData.fullAssetName,
      author: organizationData.name,
      creation_date: formData.fileCreationDate,
      organization: organizationData,
      technical_specs: {
        description: formData.description,
        file_name: formData.fileName,
        file_size: formData.fileSize,
        file_type: formData.fileType,
        file_extension: formData.fileExtension,
        file_origin: formData.fileOrigin || undefined
      }
    };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.isValid) {
      setSubmitError(validation.errors.join(', '));
      return;
    }

    setSubmitError(null);

    try {
      const certificationData = prepareCertificationData();
      
      await startCertificationFlow({
        certificationData,
        files: uploadedFile ? [uploadedFile] : [],
        assetName: formData.fullAssetName,
        unitName: formData.unitName,
        formData: formData
      });

      // setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Errore durante la certificazione');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Generate thumbnail for documents and files
  const generateFileThumbnail = (fileType: string, fileName: string, fileSize: number): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const sizeText = formatFileSize(fileSize);
    
    // Determine file category and icon
    let iconSvg = '';
    let categoryColor = '#6b7280';
    let categoryText = 'File';
    
    if (fileType.includes('pdf') || extension === 'pdf') {
      iconSvg = `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#ef4444"/><polyline points="14,2 14,8 20,8" fill="none" stroke="#ffffff" stroke-width="2"/><line x1="16" y1="13" x2="8" y2="13" stroke="#ffffff" stroke-width="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="#ffffff" stroke-width="2"/><polyline points="10,9 9,9 8,9" fill="none" stroke="#ffffff" stroke-width="2"/>`;
      categoryColor = '#ef4444';
      categoryText = 'PDF';
    } else if (['doc', 'docx'].includes(extension)) {
      iconSvg = `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#3b82f6"/><polyline points="14,2 14,8 20,8" fill="none" stroke="#ffffff" stroke-width="2"/><line x1="16" y1="13" x2="8" y2="13" stroke="#ffffff" stroke-width="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="#ffffff" stroke-width="2"/><polyline points="10,9 9,9 8,9" fill="none" stroke="#ffffff" stroke-width="2"/>`;
      categoryColor = '#3b82f6';
      categoryText = 'DOC';
    } else if (['txt', 'rtf'].includes(extension)) {
      iconSvg = `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#10b981"/><polyline points="14,2 14,8 20,8" fill="none" stroke="#ffffff" stroke-width="2"/><line x1="16" y1="13" x2="8" y2="13" stroke="#ffffff" stroke-width="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="#ffffff" stroke-width="2"/><polyline points="10,9 9,9 8,9" fill="none" stroke="#ffffff" stroke-width="2"/>`;
      categoryColor = '#10b981';
      categoryText = 'TXT';
    } else if (['xls', 'xlsx'].includes(extension)) {
      iconSvg = `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#059669"/><polyline points="14,2 14,8 20,8" fill="none" stroke="#ffffff" stroke-width="2"/><line x1="16" y1="13" x2="8" y2="13" stroke="#ffffff" stroke-width="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="#ffffff" stroke-width="2"/><polyline points="10,9 9,9 8,9" fill="none" stroke="#ffffff" stroke-width="2"/>`;
      categoryColor = '#059669';
      categoryText = 'XLS';
    } else if (['ppt', 'pptx'].includes(extension)) {
      iconSvg = `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#dc2626"/><polyline points="14,2 14,8 20,8" fill="none" stroke="#ffffff" stroke-width="2"/><line x1="16" y1="13" x2="8" y2="13" stroke="#ffffff" stroke-width="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="#ffffff" stroke-width="2"/><polyline points="10,9 9,9 8,9" fill="none" stroke="#ffffff" stroke-width="2"/>`;
      categoryColor = '#dc2626';
      categoryText = 'PPT';
    } else {
      iconSvg = `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#6b7280"/><polyline points="14,2 14,8 20,8" fill="none" stroke="#ffffff" stroke-width="2"/><line x1="16" y1="13" x2="8" y2="13" stroke="#ffffff" stroke-width="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="#ffffff" stroke-width="2"/><polyline points="10,9 9,9 8,9" fill="none" stroke="#ffffff" stroke-width="2"/>`;
      categoryColor = '#6b7280';
      categoryText = extension.toUpperCase() || 'FILE';
    }

    const svg = `
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="120" height="120" rx="12" fill="#1e293b"/>
        
        <!-- File Icon -->
        <g transform="translate(30, 20)">
          <rect width="60" height="80" rx="4" fill="${categoryColor}"/>
          <g transform="translate(8, 8)">
            ${iconSvg}
          </g>
        </g>
        
        <!-- File Type Badge -->
        <rect x="8" y="8" width="32" height="16" rx="8" fill="${categoryColor}" opacity="0.9"/>
        <text x="24" y="18" text-anchor="middle" fill="white" font-size="8" font-family="Arial" font-weight="bold">${categoryText}</text>
        
        <!-- File Name (truncated) -->
        <text x="60" y="110" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="Arial">
          ${fileName.length > 15 ? fileName.substring(0, 12) + '...' : fileName}
        </text>
        
        <!-- File Size -->
        <text x="60" y="125" text-anchor="middle" fill="#64748b" font-size="8" font-family="Arial">
          ${sizeText}
        </text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  return (
    <>
      <FormLayout 
        title="Nuova Certificazione"
        sidebar={
          <OrganizationData 
            data={organizationData}
            onUpdate={handleOrganizationUpdate}
          />
        }
      >
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h2 className="text-xl font-semibold text-white mb-6">Certificazione</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <FolderIcon className="w-5 h-5" />
                File da Certificare
              </h3>
              
              {/* Enhanced File Upload with Preview */}
              <div className="relative">
                {!filePreview ? (
                  <FileUpload
                    files={[]}
                    onFileUpload={handleFileUpload}
                    accept="*/*"
                    multiple={false}
                    label="Carica File *"
                    description="Massimo 20MB, tutti i formati supportati"
                    id="file-upload"
                  />
                ) : (
                  <div className="relative group">
                    {/* File Preview in Upload Area */}
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 bg-slate-800 hover:border-blue-500 transition-colors">
                      <div className="flex items-center justify-center min-h-[120px]">
                        {previewType === 'image' && (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="max-w-full max-h-32 rounded-lg shadow-lg object-contain"
                            onError={() => setFilePreview(null)}
                          />
                        )}
                        {previewType === 'video' && (
                          <div className="relative">
                            <video
                              src={filePreview}
                              className="max-w-full max-h-32 rounded-lg shadow-lg"
                              controls
                              preload="metadata"
                            />
                            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                              <VideoCameraIcon className="w-3 h-3" />
                              Video
                            </div>
                          </div>
                        )}
                        {previewType === 'audio' && (
                          <div className="w-full max-w-md">
                            <audio
                              src={filePreview}
                              controls
                              className="w-full"
                            />
                            <div className="text-center mt-2 text-slate-300 text-sm flex items-center justify-center gap-1">
                              <SpeakerWaveIcon className="w-4 h-4" />
                              File Audio
                            </div>
                          </div>
                        )}
                        {previewType === 'document' && (
                          <div className="flex items-center justify-center">
                            <img
                              src={generateFileThumbnail(formData.fileType, formData.fileName, formData.fileSize)}
                              alt="Document Thumbnail"
                              className="max-w-full max-h-32 rounded-lg shadow-lg object-contain"
                            />
                          </div>
                        )}
                        {previewType === 'other' && (
                          <div className="flex items-center justify-center">
                            <img
                              src={generateFileThumbnail(formData.fileType, formData.fileName, formData.fileSize)}
                              alt="File Thumbnail"
                              className="max-w-full max-h-32 rounded-lg shadow-lg object-contain"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* File Info */}
                      <div className="mt-4 text-center">
                        <div className="text-white font-medium">{formData.fileName}</div>
                        <div className="text-slate-400 text-sm">{formatFileSize(formData.fileSize)}</div>
                      </div>
                    </div>
                    
                    {/* Hover Overlay with Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            // Clear current file
                            setFilePreview(null);
                            setPreviewType('other');
                            setUploadedFile(null);
                            setFormData(prev => ({
                              ...prev,
                              fileName: '',
                              fileSize: 0,
                              fileType: '',
                              fileExtension: '',
                              fileCreationDate: ''
                            }));
                          }}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-slate-600 hover:border-slate-500"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Rimuovi
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Trigger file input
                            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                            if (fileInput) {
                              fileInput.click();
                            }
                          }}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-slate-600 hover:border-slate-500"
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                          Sostituisci
                        </button>
                      </div>
                    </div>
                    
                    {/* Hidden File Input for Replace */}
                    <input
                      type="file"
                      id="file-upload"
                      accept="*/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileUpload(Array.from(e.target.files));
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* File Metadata (Read-only) */}
              {formData.fileName && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-700 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Nome File</label>
                    <input
                      type="text"
                      value={formData.fileName}
                      readOnly
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Dimensione</label>
                    <input
                      type="text"
                      value={formatFileSize(formData.fileSize)}
                      readOnly
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Tipo</label>
                    <input
                      type="text"
                      value={formData.fileType || 'Non rilevato'}
                      readOnly
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Estensione</label>
                    <input
                      type="text"
                      value={formData.fileExtension || 'Non rilevata'}
                      readOnly
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Data Creazione</label>
                    <input
                      type="text"
                      value={formData.fileCreationDate || 'Non rilevata'}
                      readOnly
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Project and Asset Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <DocumentIcon className="w-5 h-5" />
                Informazioni Progetto e Asset
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome Progetto *"
                  placeholder="es. PROJ01"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                  required
                  maxLength={10}
                  helperText="Massimo 10 caratteri"
                />
                
                <Input
                  label="Nome Asset *"
                  placeholder="es. ASSET001"
                  value={formData.assetName}
                  onChange={(e) => handleInputChange('assetName', e.target.value)}
                  required
                  maxLength={19}
                  helperText="Massimo 19 caratteri"
                />
              </div>
              
              {/* Auto-generated fields (Read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Unit Name (Auto-generato)
                  </label>
                  <div>
                    <input
                      type="text"
                      value={formData.unitName || 'Generato automaticamente'}
                      readOnly
                      className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 rounded-lg text-slate-300 text-sm font-mono cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Generato da: Nome Progetto + Nome Asset</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Nome Asset (Auto-generato)
                  </label>
                  <div>
                    <input
                      type="text"
                      value={formData.fullAssetName || 'Generato automaticamente'}
                      readOnly
                      className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 rounded-lg text-slate-300 text-sm cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Formato: "Progetto / Asset" (max 32 caratteri)</p>
                </div>
              </div>
            </div>

            {/* Type Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <DocumentIcon className="w-5 h-5" />
                Tipo di Certificazione
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-white mb-3">Tipo *</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {formData.type === 'altro' && (
                <Input
                  label="Specifica Tipo Personalizzato *"
                  placeholder="Inserisci il tipo personalizzato"
                  value={formData.customType}
                  onChange={(e) => handleInputChange('customType', e.target.value)}
                  required
                />
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Descrizione * <span className="text-slate-400">({formData.description.length}/300 caratteri)</span>
              </label>
              <textarea
                placeholder="Inserisci descrizione dettagliata tecnica e contestuale."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                maxLength={300}
                rows={4}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* File Origin (Optional) */}
            <div>
              <Input
                label="Origine del File"
                placeholder="Informazioni sulla fonte del file (opzionale)"
                value={formData.fileOrigin}
                onChange={(e) => handleInputChange('fileOrigin', e.target.value)}
                maxLength={100}
                helperText="Massimo 100 caratteri"
              />
            </div>

            {/* Error Display */}
            {submitError && (
              <Alert variant="error" title="Errore di Validazione">
                {submitError}
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onBack}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
              >
                {isProcessing ? 'Certificando...' : 'Certifica'}
              </Button>
            </div>
          </form>
        </div>
      </FormLayout>

      {/* Certification Modal */}
      {isModalOpen && (
        <CertificationModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Certificazione"
          steps={steps}
          isProcessing={isProcessing}
          result={mintResult}
          onRetryStep={retryStep}
        />
      )}
    </>
  );
};
