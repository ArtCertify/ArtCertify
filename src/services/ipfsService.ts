import axios, { type AxiosResponse } from 'axios';

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
      const options: any = {
        pinataOptions: {
          cidVersion: 1,
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
        }
      };

      if (metadata) {
        options.pinataMetadata = {
          name: metadata.name || 'NFT Metadata',
          keyvalues: metadata.keyvalues || {}
        };
      }

      const response: AxiosResponse<IPFSUploadResponse> = await axios.post(
        `${this.baseURL}/pinning/pinJSONToIPFS`,
        jsonData,
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.apiSecret,
          },
          params: options,
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
   * Upload multiple files individually and create a comprehensive metadata JSON
   */
  async uploadCertificationAssets(
    files: File[],
    certificationData: IPFSMetadata['certification_data'],
    formData: Record<string, any>
  ): Promise<{
    metadataHash: string;
    fileHashes: Array<{ name: string; hash: string; type: string; size: number }>;
    metadataUrl: string;
    individualFileUrls: Array<{ name: string; ipfsUrl: string; gatewayUrl: string }>;
  }> {
    try {
      // Upload all files individually first
      const fileHashes: Array<{ name: string; hash: string; type: string; size: number }> = [];
      const individualFileUrls: Array<{ name: string; ipfsUrl: string; gatewayUrl: string }> = [];
      
      console.log(`Starting upload of ${files.length} files to IPFS...`);
      
      for (const file of files) {
        console.log(`Uploading file: ${file.name} (${file.size} bytes)`);
        
        const uploadResult = await this.uploadFile(file, {
          name: `${certificationData?.unique_id || 'file'}_${file.name}`,
          keyvalues: {
            asset_id: certificationData?.unique_id || '',
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
          gatewayUrl: this.getCustomGatewayUrl(uploadResult.IpfsHash)
        });
        
        console.log(`✓ File uploaded: ${file.name} -> ${uploadResult.IpfsHash}`);
      }

      // Create comprehensive metadata with all form data and file references
      const metadata: IPFSMetadata = {
        name: certificationData?.title || String(formData.assetName || 'Certified Asset'),
        description: String(formData.description),
        image: fileHashes.length > 0 ? `ipfs://${fileHashes[0].hash}` : '',
        attributes: [
          {
            trait_type: 'Asset Type',
            value: certificationData?.asset_type || 'Unknown'
          },
          {
            trait_type: 'Author',
            value: certificationData?.author || 'Unknown'
          },
          {
            trait_type: 'Creation Date',
            value: certificationData?.creation_date || 'Unknown'
          },
          {
            trait_type: 'Organization',
            value: certificationData?.organization?.name || 'Unknown'
          },
          {
            trait_type: 'Asset Name',
            value: formData.assetName || 'Unknown'
          },
          {
            trait_type: 'Unit Name',
            value: formData.unitName || 'Unknown'
          }
        ],
        properties: {
          // All form data structured
          form_data: {
            ...formData,
            timestamp: new Date().toISOString()
          },
          // Individual file CIDs and URLs
          files_metadata: individualFileUrls,
          // IPFS upload info
          ipfs_info: {
            uploaded_at: new Date().toISOString(),
            total_files: fileHashes.length,
            gateway: import.meta.env.VITE_PINATA_GATEWAY
          }
        },
        certification_data: certificationData ? {
          asset_type: certificationData.asset_type,
          unique_id: certificationData.unique_id,
          title: certificationData.title,
          author: certificationData.author,
          creation_date: certificationData.creation_date,
          organization: certificationData.organization,
          technical_specs: certificationData.technical_specs,
          files: fileHashes
        } : undefined
      };

      console.log('Creating metadata JSON with all form data and file CIDs...');

      // Upload comprehensive metadata JSON
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

      console.log(`✓ Metadata JSON uploaded: ${metadataResult.IpfsHash}`);

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
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }

  /**
   * Get IPFS URL using custom gateway
   */
  getCustomGatewayUrl(hash: string, gateway?: string): string {
    const gatewayUrl = gateway || import.meta.env.VITE_PINATA_GATEWAY;
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