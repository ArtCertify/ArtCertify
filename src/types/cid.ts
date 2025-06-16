export interface CidMetadata {
  cid: string;
  version: number;
  codec: string;
  multihash: {
    algorithm: string;
    digest: Uint8Array;
    size: number;
  };
  algorandAddress?: string;
}

export interface DecodingResult {
  success: boolean;
  data?: CidMetadata;
  error?: string;
}

export interface CertificationVersion {
  version: number;
  transactionId: string;
  timestamp: number;
  reserveAddress: string;
  decodedInfo: string;
  changes?: string[];
}

export interface CertificationData {
  id: string;
  name: string;
  description: string;
  creator: string;
  creationDate: number;
  lastModified: number;
  status: 'Certificato' | 'In Revisione' | 'Scaduto';
  currentVersion: number;
  versions: CertificationVersion[];
  attachments: AttachmentInfo[];
}

export interface AttachmentInfo {
  name: string;
  type: string;
  size?: string;
  url?: string;
  ipfsHash?: string;
  description?: string;
} 