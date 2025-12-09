import React, { useState, useEffect, useRef } from 'react';
import { FormLayout, Modal } from '../ui';
import { CertificationModal } from '../modals/CertificationModal';
import { usePeraCertificationFlow } from '../../hooks/usePeraCertificationFlow';
import { useProjectsCache } from '../../hooks/useProjectsCache';
import { useAuth } from '../../contexts/AuthContext';
import { Input, Button, Alert, FileUpload, ReusableDropdown } from '../ui';
import {
  TrashIcon,
  ArrowPathIcon,
  DocumentIcon,
  FolderIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  ChevronDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import MinIOService from '../../services/minioServices';
import { useNavigate } from 'react-router-dom';



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
  // Auth and cache hooks
  const { logout, userAddress } = useAuth();
  const { getCachedProjects } = useProjectsCache();
  const minioService = new MinIOService();

  const navigate = useNavigate();



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
  const [organizationData] = useState({
    name: 'Museo Arte',
    code: 'MA001',
    type: 'Museo',
    city: 'Roma'
  });

  // Projects cache state
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);

  // Project dropdown state
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<string[]>([]);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isUploadFailed, setIsUploadFailed] = useState(false);
  const [isUploadLocked, setIsUploadLocked] = useState(false);
  const [isUploadCompleted, setIsUploadCompleted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const [nextAction, setNextAction] = useState<"home" | "profile" | "logout" | null>(null);

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
    type: '',
    customType: ''
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video' | 'audio' | 'document' | 'other'>('other');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load projects from cache
  useEffect(() => {
    if (userAddress) {
      const cachedProjects = getCachedProjects(userAddress);
      setAvailableProjects(cachedProjects);
      setFilteredProjects(cachedProjects);
    }
  }, [userAddress, getCachedProjects]);

  // Filter projects based on search term (case-insensitive)
  useEffect(() => {
    if (projectSearchTerm.trim() === '') {
      setFilteredProjects(availableProjects);
    } else {
      const filtered = availableProjects.filter(project =>
        project.toLowerCase().includes(projectSearchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [projectSearchTerm, availableProjects]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
        setProjectSearchTerm(formData.projectName);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [formData.projectName]);

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



  useEffect(() => {
    if (!isUploadingFile) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // obbligatorio per mostrare il popup
    };

    window.addEventListener("beforeunload", handler);

    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [isUploadingFile]);


  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;

    return () => {
      controller.abort();
    };
  }, []);

  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];

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

  // Handle project dropdown functions
  const handleProjectInputChange = (value: string) => {
    setProjectSearchTerm(value);
    setFormData(prev => ({
      ...prev,
      projectName: value
    }));
    setSubmitError(null);
  };

  const handleProjectSelect = (projectName: string) => {
    setFormData(prev => ({
      ...prev,
      projectName: projectName
    }));
    setProjectSearchTerm(projectName);
    setIsProjectDropdownOpen(false);
    setSubmitError(null);
  };

  const handleCreateNewProject = () => {
    if (projectSearchTerm.trim()) {
      setFormData(prev => ({
        ...prev,
        projectName: projectSearchTerm.trim()
      }));
      setIsProjectDropdownOpen(false);
      setSubmitError(null);
    }
  };

  const toggleProjectDropdown = () => {
    setIsProjectDropdownOpen(!isProjectDropdownOpen);
    if (!isProjectDropdownOpen) {
      setProjectSearchTerm(formData.projectName);
    }
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


  const uploadToMinio = async (): Promise<void> => {
    setIsUploadingFile(true);
    setIsUploadLocked(true);
    try {
      await minioService.uploadCertificationToMinio(
        uploadedFile ? [uploadedFile] : [],
        (progress) => setUploadProgress(progress),
        controllerRef.current!.signal
      );
      setIsUploadCompleted(true);
      setIsUploadFailed(false);
    } catch (error) {
      setIsUploadFailed(true);
      setIsUploadLocked(false);
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);



  useEffect(() => {
    const handler = () => {
      setShowExitModal(true);
    };

    window.addEventListener('openExitModal', handler);

    return () => {
      window.removeEventListener('openExitModal', handler);
    };
  }, []);


  const handlePendingAction = (action: "home" | "profile" | "logout") => {
    setNextAction(action);
    setShowExitModal(true);
  };

  return (
    <>
      <FormLayout isUploadingFile={isUploadingFile}  onRequestExitAction={handlePendingAction}>
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-1">Nuova Certificazione</h1>
            <p className="text-slate-400 text-sm">Certifica un file e crea un asset digitale sulla blockchain Algorand</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload Section */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FolderIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">File da Certificare</h3>
                  <p className="text-slate-400 text-xs">Carica il file che vuoi certificare</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* File Upload Box */}
                <div className="space-y-4">
                  {/* Enhanced File Upload with Preview */}
                  <div className="relative">
                    {!filePreview ? (
                      <FileUpload
                        files={[]}
                        onFileUpload={handleFileUpload}
                        accept="*/*"
                        multiple={false}
                        label="Carica File *"
                        description="Tutti i formati sono supportati"
                        id="file-upload"
                      />
                    ) : (
                      <div className="relative group">
                        {/* File Preview in Upload Area */}
                        <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 bg-slate-800 hover:border-blue-500 transition-colors">
                          <div className="flex items-center justify-center min-h-[180px]">
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

                        </div>

                        {/* Hover Overlay with Actions */}
                        {!isUploadLocked ?
                          < div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
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
                          : null}


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
                </div>

                {/* File Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-white mb-3">Informazioni File</h4>
                  <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Nome File:</span>
                      <span className="text-sm text-white font-medium">
                        {formData.fileName || 'Nessun file selezionato'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Dimensione:</span>
                      <span className="text-sm text-white font-medium">
                        {formData.fileSize ? formatFileSize(formData.fileSize) : 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Tipo:</span>
                      <span className="text-sm text-white font-medium">
                        {formData.fileType || 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Estensione:</span>
                      <span className="text-sm text-white font-medium">
                        {formData.fileExtension || 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Data Creazione:</span>
                      <span className="text-sm text-white font-medium">
                        {formData.fileCreationDate || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>


              {/* Allert confirm */}
              <div style={{ marginTop: "10px" }}>
                {formData.fileCreationDate !== "" && (
                  <Alert
                    variant={
                      isUploadFailed
                        ? "error"
                        : isUploadCompleted
                          ? "success"
                          : "info"
                    }
                    title={
                      isUploadFailed
                        ? "Caricamento file fallito"
                        : isUploadCompleted
                          ? "Upload completato"
                          : "Conferma caricamento file"
                    }
                    className="space-y-4"
                  >
                    <div className="flex flex-col gap-4 self-center">
                      <p>
                        {isUploadFailed
                          ? "Clicca sul pulsante qui sotto per riprovare il caricamento del file."
                          : isUploadCompleted
                            ? "Il file è stato caricato correttamente."
                            : "Sei sicuro di voler caricare questo file? Clicca sul pulsante qui sotto per procedere."}
                      </p>

                      {/* Mostra il bottone solo se l’upload non è completato */}
                      {!isUploadCompleted && (
                        <div className="w-2/5 mx-auto">
                          <Button
                            disabled={isUploadingFile}
                            className="w-full px-6 py-2 shadow-lg hover:shadow-xl"
                            onClick={uploadToMinio}
                          >
                            {isUploadingFile
                              ? `Upload in corso... ${uploadProgress}%`
                              : isUploadFailed
                                ? "Ritenta upload"
                                : "Upload file"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Alert>
                )}
              </div>
            </div>

            {/* Project and Asset Information */}
            <div className={`bg-slate-800 rounded-xl border border-slate-700 p-4 ${!isUploadLocked ? "blur-sm pointer-events-none" : ""}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <DocumentIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Informazioni Progetto e Asset</h3>
                  <p className="text-slate-400 text-xs">Definisci i dettagli del progetto e dell'asset</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="relative" ref={projectDropdownRef}>
                    <label className="block text-sm font-medium text-white mb-3">
                      Nome Progetto *
                    </label>

                    {/* Custom dropdown input */}
                    <div className="relative">
                      <input
                        type="text"
                        value={projectSearchTerm}
                        onChange={(e) => handleProjectInputChange(e.target.value)}
                        onFocus={() => setIsProjectDropdownOpen(true)}
                        onClick={() => setIsProjectDropdownOpen(true)}
                        placeholder="Cerca o scrivi un progetto..."
                        required
                        maxLength={10}
                        className="w-full px-4 py-3 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={toggleProjectDropdown}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Dropdown menu */}
                    {isProjectDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {/* Show filtered projects */}
                        {filteredProjects.map((project) => (
                          <button
                            key={project}
                            type="button"
                            onClick={() => handleProjectSelect(project)}
                            className="w-full px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
                          >
                            <FolderIcon className="w-4 h-4 text-slate-400" />
                            {project}
                          </button>
                        ))}

                        {/* Always show create new project button if there's a search term */}
                        {projectSearchTerm.trim() && (
                          <div className={`${filteredProjects.length > 0 ? 'border-t border-slate-600' : ''}`}>
                            <button
                              type="button"
                              onClick={handleCreateNewProject}
                              className="w-full px-4 py-3 text-left text-blue-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
                            >
                              <PlusIcon className="w-4 h-4" />
                              Crea "{projectSearchTerm}"
                            </button>
                          </div>
                        )}

                        {/* Show message when no projects and no search term */}
                        {filteredProjects.length === 0 && !projectSearchTerm.trim() && (
                          <div className="px-4 py-3 text-slate-400 text-center">
                            {availableProjects.length === 0
                              ? 'Nessun progetto in cache'
                              : 'Inizia a scrivere per cercare o creare un progetto'
                            }
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-slate-500 mt-1">
                      {availableProjects.length > 0
                        ? `${availableProjects.length} progetti disponibili`
                        : 'Nessun progetto in cache'
                      }
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      Nome Asset *
                    </label>
                    <input
                      type="text"
                      placeholder="es. ASSET001"
                      value={formData.assetName}
                      onChange={(e) => handleInputChange('assetName', e.target.value)}
                      required
                      maxLength={19}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Massimo 19 caratteri
                    </p>
                  </div>
                </div>

                {/* Auto-generated fields (Read-only) - Same row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            </div>

            {/* Type Selection */}
            <div className={`bg-slate-800 rounded-xl border border-slate-700 p-4 ${!isUploadLocked ? "blur-sm pointer-events-none" : ""}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <DocumentIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Tipo di Certificazione</h3>
                  <p className="text-slate-400 text-xs">Specifica il tipo e la descrizione della certificazione</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Tipo *</label>
                    <ReusableDropdown
                      value={formData.type}
                      onChange={(value) => handleInputChange('type', value)}
                      options={TYPE_OPTIONS}
                      placeholder="Seleziona tipo"
                      required
                    />
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

                <div className="space-y-4">
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
                </div>
              </div>
            </div>

            {/* File Origin (Optional) */}
            <div className={`bg-slate-800 rounded-xl border border-slate-700 p-4 ${!isUploadLocked ? "blur-sm pointer-events-none" : ""}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <DocumentIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Origine del File</h3>
                  <p className="text-slate-400 text-xs">Informazioni aggiuntive sulla fonte (opzionale)</p>
                </div>
              </div>

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
            <div className="flex justify-center gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onBack}
                className="px-6 py-2"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={isProcessing || !isUploadCompleted}
                className="px-6 py-2 shadow-lg hover:shadow-xl"
              >
                {isProcessing ? 'Certificando...' : 'Certifica'}
              </Button>
            </div>
          </form>
        </div >
      </FormLayout >

      {/* Certification Modal */}
      {
        isModalOpen && (
          <CertificationModal
            isOpen={isModalOpen}
            onClose={closeModal}
            title="Certificazione"
            steps={steps}
            isProcessing={isProcessing}
            result={mintResult}
            onRetryStep={retryStep}
          />
        )
      }

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <Modal
          isOpen={showExitModal}
          onClose={() => setShowExitModal(false)}
          title="Stai caricando un file"
          children={
            <div className="space-y-4">
              <p className="text-slate-300">
                Il caricamento del file è ancora in corso. Se esci adesso, l’upload verrà interrotto e perderai il progresso. </p>
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowExitModal(false)}
                >
                  Resta
                </Button>
                <Button
                  onClick={async () => {
                    setShowExitModal(false);
                    if (nextAction === "home") navigate("/");
                    if (nextAction === "profile") navigate('/profile');;
                    if (nextAction === "logout") await logout();
                  }}
                >
                  Esci
                </Button>
              </div>
            </div>
          }

        />
      )}
    </>
  );
};
