import { useState, useEffect } from 'react';
import { IPFSUrlService } from '../services/ipfsUrlService';

export interface IPFSMetadata {
  name: string;
  description: string;
  image: string;
  properties: {
    form_data: {
      fileName: string;
      fileSize: number;
      fileType: string;
      fileExtension: string;
      fileCreationDate: string;
      projectName: string;
      assetName: string;
      unitName: string;
      fullAssetName: string;
      description: string;
      fileOrigin: string;
      type: string;
      customType: string;
      timestamp: string;
    };
    files_metadata: Array<{
      name: string;
      ipfsUrl: string;
      gatewayUrl: string;
    }>;
    ipfs_info: {
      uploaded_at: string;
      total_files: number;
      gateway: string;
    };
  };
}

export const useIPFSMetadata = (cid: string | undefined) => {
  const [metadata, setMetadata] = useState<IPFSMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cid) {
      setMetadata(null);
      return;
    }

    const loadMetadata = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Loading IPFS metadata from CID:', cid);
        
        // Genera l'URL gateway usando il nostro gateway configurato
        const gatewayUrl = IPFSUrlService.getGatewayUrl(cid);
        console.log('🔍 Generated gateway URL:', gatewayUrl);
        
        // Carica il JSON dal gateway
        console.log('🌐 Attempting fetch from:', gatewayUrl);
        
        const response = await fetch(gatewayUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          // Forza il bypass della cache
          cache: 'no-cache'
        });
        
        console.log('🌐 Response status:', response.status);
        console.log('🌐 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }

        const jsonData = await response.json();
        console.log('✅ Successfully loaded JSON from gateway:', gatewayUrl);
        console.log('📄 JSON Content:', JSON.stringify(jsonData, null, 2));

        setMetadata(jsonData);
      } catch (err) {
        console.error('❌ Errore nel caricamento dei metadati IPFS:', err);
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, [cid]);

  return { metadata, loading, error };
};
