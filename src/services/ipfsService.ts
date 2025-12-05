import axios, { type AxiosResponse } from 'axios';
import { config } from '../config/environment';
import { IPFSUrlService } from './ipfsUrlService';

export interface IPFSUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

export interface IPFSFileMetadata {
  name?: string;
  keyvalues?: Record<string, string | number>;
}

export interface IPFSMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties?: Record<string, unknown>;
  // Additional fields for certification
  certification_data?: {
    asset_type: string;
    unique_id: string;
    title: string;
    author: string;
    creation_date: string;
    organization: {
      name: string;
      code: string;
      type: string;
      city: string;
    };
    technical_specs?: Record<string, string>;
    files?: Array<{
      name: string;
      hash: string;
      type: string;
      size: number;
    }>;
  };
}

class IPFSService {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly jwt: string;
  private readonly baseURL = 'https://api.pinata.cloud';

  constructor() {
    this.apiKey = import.meta.env.VITE_PINATA_API_KEY;
    this.apiSecret = import.meta.env.VITE_PINATA_API_SECRET;
    this.jwt = import.meta.env.VITE_PINATA_JWT;

    if (!this.apiKey || !this.apiSecret || !this.jwt) {
      throw new Error('Pinata API credentials not found in environment variables');
    }
  }

  /**
   * Upload a file to IPFS via Pinata
   */
  async uploadFile(file: File, metadata?: IPFSFileMetadata): Promise<IPFSUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      if (metadata) {
        if (metadata.name) {
          formData.append('pinataMetadata', JSON.stringify({
            name: metadata.name,
            keyvalues: metadata.keyvalues || {}
          }));
        }

        formData.append('pinataOptions', JSON.stringify({
          cidVersion: 1,
          wrapWithDirectory: false,
          customPinPolicy: {
            regions: [
              {
                id: 'FRA1',
                desiredReplicationCount: 1
              },
              {
                id: 'NYC1',
                desiredReplicationCount: 1
              }
            ]
          }
        }));
      }

      const response: AxiosResponse<IPFSUploadResponse> = await axios.post(
        `${this.baseURL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.apiSecret,
          },
          timeout: 120000, // 2 minutes timeout for large files
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload JSON metadata to IPFS via Pinata
   */
  async uploadJSON(jsonData: IPFSMetadata | Record<string, unknown>, metadata?: IPFSFileMetadata): Promise<IPFSUploadResponse> {
    try {
      // Clean and validate JSON data to remove any control characters
      const cleanJsonData = this.cleanJsonData(jsonData);
      
      // Validate that the cleaned data is still valid JSON
      try {
        JSON.stringify(cleanJsonData);
      } catch (error) {
        throw new Error('Invalid JSON data after cleaning');
      }
      
      const options: any = {
        pinataOptions: {
          cidVersion: 1,
          wrapWithDirectory: false,
          customPinPolicy: {
            regions: [
              {
                id: 'FRA1',
                desiredReplicationCount: 1
              },
              {
                id: 'NYC1',
                desiredReplicationCount: 1
              }
            ]
          }
        },
        // Force raw codec for ARC-0019 compatibility
        cidVersion: 1,
        codec: 'raw'
      };

      if (metadata) {
        options.pinataMetadata = {
          name: metadata.name || 'NFT Metadata',
          keyvalues: metadata.keyvalues || {}
        };
      }

      // Per l'API Pinata, le opzioni devono essere nel body, non nei params
      const requestBody = {
        pinataContent: cleanJsonData,
        ...options
      };

      const response: AxiosResponse<IPFSUploadResponse> = await axios.post(
        `${this.baseURL}/pinning/pinJSONToIPFS`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.apiSecret,
          },
          timeout: 60000, // 1 minute timeout for JSON
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw new Error(`Failed to upload JSON to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean JSON data to remove control characters and ensure proper formatting
   */
  private cleanJsonData(data: any): any {
    if (typeof data === 'string') {
      // Remove control characters except newlines and tabs
      return data.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.cleanJsonData(item));
    }
    
    if (data && typeof data === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Clean the key
        const cleanKey = key.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        // Clean the value
        cleaned[cleanKey] = this.cleanJsonData(value);
      }
      return cleaned;
    }
    
    return data;
  }

  /**
   * Upload certification version with custom JSON and optional new files
   */
  async uploadCertificationVersion(
    files: File[],
    customJson: any,
    formData: Record<string, any>,
    userAddress?: string
  ): Promise<{
    metadataHash: string;
    fileHashes: Array<{ name: string; hash: string; type: string; size: number }>;
    metadataUrl: string;
    individualFileUrls: Array<{ name: string; ipfsUrl: string; gatewayUrl: string }>;
  }> {
    try {
      // Build MINIO URLs for new files (files are already uploaded to MINIO)
      const fileHashes: Array<{ name: string; hash: string; type: string; size: number }> = [];
      const individualFileUrls: Array<{ name: string; ipfsUrl: string; gatewayUrl: string }> = [];
      
      const lowercaseAddress = userAddress?.toLowerCase() || '';
      
      for (const file of files) {
        // Build MINIO URL: https://s3.caputmundi.artcertify.com/{lowercase addressUser}/{filename.extension}
        const fileName = encodeURIComponent(file.name);
        const minioUrl = `https://s3.caputmundi.artcertify.com/${lowercaseAddress}/${fileName}`;
        
        const fileInfo = {
          name: file.name,
          hash: '', // No IPFS hash since file is not uploaded to IPFS
          type: file.type,
          size: file.size
        };
        
        fileHashes.push(fileInfo);
        
        // Use MINIO URL instead of IPFS URL
        individualFileUrls.push({
          name: file.name,
          s3StorageUrl: minioUrl, // Store MINIO URL in s3StorageUrl field
          gatewayUrl: minioUrl // Store MINIO URL in gatewayUrl field (for backward compatibility)
        } as any); // Type assertion needed because interface still has ipfsUrl
      }

      // Get the first file URL for the image field (if new file uploaded)
      const firstFileUrl = formData.imageFile && individualFileUrls.length > 0 
        ? individualFileUrls[0].gatewayUrl 
        : customJson.image; // Keep existing image if no new file

      const updatedJson = {
        ...customJson, // Keep ALL existing data
        // Image should always be the current primary image from File Certificazione
        // Only update if a new image file is uploaded (formData.imageFile)
        image: firstFileUrl,
        properties: {
          ...customJson.properties, // Keep ALL existing properties
          form_data: {
            ...customJson.properties?.form_data, // Keep ALL existing form_data
            ...formData, // Add form data changes
            timestamp: new Date().toISOString()
          },
          // Update files_metadata - prioritize new image file if uploaded, otherwise keep existing primary image
          files_metadata: formData.imageFile ? 
            [
              individualFileUrls[0], // New primary image (first uploaded file)
              ...(customJson.properties?.files_metadata?.slice(1) || []), // Keep existing additional files
              ...individualFileUrls.slice(1) // Add remaining new files
            ] : [
              ...(customJson.properties?.files_metadata?.slice(0, 1) || []), // Keep existing primary image
              ...individualFileUrls // Add new files
            ],
          // Update storage info (MINIO instead of IPFS)
          storage_info: {
            ...customJson.properties?.storage_info, // Keep existing storage info
            uploaded_at: new Date().toISOString(),
            total_files: formData.imageFile ? 
              (customJson.properties?.files_metadata?.slice(1)?.length || 0) + individualFileUrls.length :
              (customJson.properties?.files_metadata?.slice(0, 1)?.length || 0) + individualFileUrls.length,
            storage_type: 'minio',
            base_url: 'https://s3.caputmundi.artcertify.com'
          }
        }
      };

      // Upload updated JSON to IPFS (only the JSON, not the files)
      const metadataResult = await this.uploadJSON(updatedJson, {
        name: `${formData.assetName || 'CERT'}_metadata.json`,
        keyvalues: {
          asset_id: formData.assetName || '',
          metadata_type: 'certification',
          files_count: fileHashes.length.toString(),
          upload_timestamp: new Date().toISOString()
        }
      });

      return {
        metadataHash: metadataResult.IpfsHash,
        fileHashes,
        metadataUrl: `ipfs://${metadataResult.IpfsHash}`,
        individualFileUrls
      };
    } catch (error) {
      console.error('❌ Error uploading certification version:', error);
      throw new Error(`Failed to upload certification version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload organization version with custom JSON and optional new files
   */
  async uploadOrganizationVersion(
    files: File[],
    customJson: any,
    formData: Record<string, any>
  ): Promise<{
    metadataHash: string;
    fileHashes: Array<{ name: string; hash: string; type: string; size: number }>;
    metadataUrl: string;
    individualFileUrls: Array<{ name: string; ipfsUrl: string; gatewayUrl: string }>;
  }> {
    try {
      // Upload new files if any
      const fileHashes: Array<{ name: string; hash: string; type: string; size: number }> = [];
      const individualFileUrls: Array<{ name: string; ipfsUrl: string; gatewayUrl: string }> = [];
      
      for (const file of files) {
        const uploadResult = await this.uploadFile(file, {
          name: `ORG_${formData.assetName || 'file'}_${file.name}`,
          keyvalues: {
            asset_id: formData.assetName || '',
            file_type: file.type,
            file_size: file.size.toString(),
            upload_timestamp: new Date().toISOString()
          }
        });

        const fileInfo = {
          name: file.name,
          hash: uploadResult.IpfsHash,
          type: file.type,
          size: file.size
        };
        
        fileHashes.push(fileInfo);
        
        individualFileUrls.push({
          name: file.name,
          ipfsUrl: `ipfs://${uploadResult.IpfsHash}`,
          gatewayUrl: IPFSUrlService.getGatewayUrl(uploadResult.IpfsHash)
        });
      }

      // Files will be handled in the updatedJson construction

      const updatedJson = {
        ...customJson,
        // Image should always be the current primary image from File Certificazione
        // Only update if a new image file is uploaded (formData.imageFile)
        image: formData.imageFile ? ((individualFileUrls[0] as any).s3StorageUrl || individualFileUrls[0].gatewayUrl || individualFileUrls[0].ipfsUrl) : customJson.image,
        properties: {
          ...customJson.properties,
          form_data: {
            ...customJson.properties?.form_data,
            ...formData,
            timestamp: new Date().toISOString()
          },
          // Update files_metadata - prioritize new image file if uploaded, otherwise keep existing primary image
          files_metadata: formData.imageFile ? 
            [
              individualFileUrls[0], // New primary image (first uploaded file)
              ...(customJson.properties?.files_metadata?.slice(1) || []), // Keep existing additional files
              ...individualFileUrls.slice(1) // Add remaining new files
            ] : [
              ...(customJson.properties?.files_metadata?.slice(0, 1) || []), // Keep existing primary image
              ...individualFileUrls // Add new files
            ],
          // Update IPFS info
          ipfs_info: {
            uploaded_at: new Date().toISOString(),
            total_files: formData.imageFile ? 
              (customJson.properties?.files_metadata?.slice(1)?.length || 0) + individualFileUrls.length :
              (customJson.properties?.files_metadata?.slice(0, 1)?.length || 0) + individualFileUrls.length,
            gateway: config.pinataGateway
          }
        }
      };

      // Upload updated JSON
      const metadataResult = await this.uploadJSON(updatedJson, {
        name: `${formData.assetName || 'ORG'}_metadata.json`,
        keyvalues: {
          asset_id: formData.assetName || '',
          metadata_type: 'organization',
          files_count: fileHashes.length.toString(),
          upload_timestamp: new Date().toISOString()
        }
      });

      return {
        metadataHash: metadataResult.IpfsHash,
        fileHashes,
        metadataUrl: `ipfs://${metadataResult.IpfsHash}`,
        individualFileUrls
      };
    } catch (error) {
      console.error('❌ Error uploading organization version:', error);
      throw new Error(`Failed to upload organization version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple files individually and create a comprehensive metadata JSON
   */
  async uploadCertificationAssets(
    files: File[],
    certificationData: IPFSMetadata['certification_data'],
    formData: Record<string, any>,
    userAddress?: string
  ): Promise<{
    metadataHash: string;
    fileHashes: Array<{ name: string; hash: string; type: string; size: number }>;
    metadataUrl: string;
    individualFileUrls: Array<{ name: string; ipfsUrl: string; gatewayUrl: string }>;
  }> {
    try {
      // Build MINIO URLs for files (files are already uploaded to MINIO)
      const fileHashes: Array<{ name: string; hash: string; type: string; size: number }> = [];
      const individualFileUrls: Array<{ name: string; ipfsUrl: string; gatewayUrl: string }> = [];
      
      const lowercaseAddress = userAddress?.toLowerCase() || '';
      
      for (const file of files) {
        // Build MINIO URL: https://s3.caputmundi.artcertify.com/{lowercase addressUser}/{filename.extension}
        // Encode filename to handle special characters in URL
        const fileName = encodeURIComponent(file.name);
        const minioUrl = `https://s3.caputmundi.artcertify.com/${lowercaseAddress}/${fileName}`;
        
        const fileInfo = {
          name: file.name,
          hash: '', // No IPFS hash since file is not uploaded to IPFS
          type: file.type,
          size: file.size
        };
        
        fileHashes.push(fileInfo);
        
        // Use MINIO URL instead of IPFS URL
        individualFileUrls.push({
          name: file.name,
          s3StorageUrl: minioUrl, // Store MINIO URL in s3StorageUrl field
          gatewayUrl: minioUrl // Store MINIO URL in gatewayUrl field (for backward compatibility)
        } as any); // Type assertion needed because interface still has ipfsUrl
      }

      // Get the first file URL for the image field
      const firstFileUrl = individualFileUrls.length > 0 ? individualFileUrls[0].gatewayUrl : '';

      // Create simplified metadata with only form data
      const metadata: IPFSMetadata = {
        name: String(formData.fullAssetName || formData.assetName || 'Certified Asset'),
        description: String(formData.description || ''),
        image: firstFileUrl, // Use MINIO URL instead of IPFS URL
        properties: {
          // All form data structured
          form_data: {
            ...formData,
            timestamp: new Date().toISOString()
          },
          // Individual file URLs (MINIO URLs instead of IPFS)
          files_metadata: individualFileUrls,
          // Storage info (MINIO instead of IPFS)
          storage_info: {
            uploaded_at: new Date().toISOString(),
            total_files: fileHashes.length,
            storage_type: 'minio',
            base_url: 'https://s3.caputmundi.artcertify.com'
          }
        }
      };

      // Upload comprehensive metadata JSON to IPFS (only the JSON, not the files)
      const metadataResult = await this.uploadJSON(metadata, {
        name: `${certificationData?.unique_id || 'metadata'}_metadata.json`,
        keyvalues: {
          asset_id: certificationData?.unique_id || '',
          metadata_type: 'certification',
          files_count: fileHashes.length.toString(),
          asset_name: formData.assetName || '',
          unit_name: formData.unitName || '',
          upload_timestamp: new Date().toISOString()
        }
      });

      return {
        metadataHash: metadataResult.IpfsHash,
        fileHashes,
        metadataUrl: `ipfs://${metadataResult.IpfsHash}`,
        individualFileUrls
      };
    } catch (error) {
      console.error('Error uploading certification assets:', error);
      throw new Error(`Failed to upload certification assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get IPFS URL for a hash
   */
  getIPFSUrl(hash: string): string {
    return `https://${config.pinataGateway}/ipfs/${hash}`;
  }

  /**
   * Get IPFS URL using custom gateway
   */
  getCustomGatewayUrl(hash: string, gateway?: string): string {
    const gatewayUrl = gateway || config.pinataGateway;
    if (gatewayUrl) {
      return `https://${gatewayUrl}/ipfs/${hash}`;
    }
    return this.getIPFSUrl(hash);
  }

  /**
   * Test connection to Pinata
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/data/testAuthentication`, {
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.apiSecret,
        },
      });
      return response.status === 200;
    } catch (error) {
      console.error('Pinata connection test failed:', error);
      return false;
    }
  }
}

export default IPFSService; 