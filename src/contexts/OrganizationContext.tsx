import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { nftService } from '../services/nftService';
import { IPFSUrlService } from '../services/ipfsUrlService';

export interface OrganizationData {
  name: string;
  image: string;
  description?: string;
  type?: string;
  city?: string;
  vatNumber?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  // NFT metadata
  assetId?: number;
  reserveAddress?: string;
  // Raw JSON data for detailed display
  rawData?: any;
}

interface OrganizationContextType {
  organizationData: OrganizationData | null;
  loading: boolean;
  error: string | null;
  refreshOrganizationData: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const { userAddress, isAuthenticated } = useAuth();
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizationData = async () => {
    if (!isAuthenticated || !userAddress) {
      setOrganizationData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all NFTs owned by the user
      const ownedNFTs = await nftService.getOwnedNFTs(userAddress);
      
      // Find organization NFT
      const organizationNFT = ownedNFTs.find(cert => 
        cert.params?.name?.startsWith('ORG: ')
      );

      if (!organizationNFT?.params?.reserve) {
        setOrganizationData(null);
        setLoading(false);
        return;
      }

      // Convert reserve address to CID and fetch JSON
      const result = IPFSUrlService.getReserveAddressUrl(organizationNFT.params.reserve);
      if (!result.success || !result.gatewayUrl) {
        setError('Errore nella conversione del reserve address');
        setLoading(false);
        return;
      }

      // Fetch JSON data
      const response = await fetch(result.gatewayUrl);
      if (!response.ok) {
        throw new Error('Errore nel fetch dei dati organizzazione');
      }
      
      const jsonData = await response.json();
      
      // Extract organization data
      const orgName = jsonData.name?.replace('ORG: ', '') || 'Organizzazione';
      const orgImage = jsonData.image || '';
      
      setOrganizationData({
        name: orgName,
        image: orgImage,
        description: jsonData.description,
        type: jsonData.properties?.form_data?.customType,
        city: jsonData.properties?.form_data?.fileOrigin,
        vatNumber: jsonData.properties?.form_data?.vatNumber,
        phone: jsonData.properties?.form_data?.phone,
        email: jsonData.properties?.form_data?.email,
        website: jsonData.properties?.form_data?.website,
        address: jsonData.properties?.form_data?.address,
        assetId: organizationNFT.index,
        reserveAddress: organizationNFT.params.reserve,
        rawData: jsonData
      });


    } catch (err) {
      console.error('❌ Error fetching organization data:', err);
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati organizzazione');
      setOrganizationData(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshOrganizationData = async () => {
    await fetchOrganizationData();
  };

  // Fetch organization data when user changes
  useEffect(() => {
    fetchOrganizationData();
  }, [userAddress, isAuthenticated]);

  const value: OrganizationContextType = {
    organizationData,
    loading,
    error,
    refreshOrganizationData
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

// Default export for Vite Fast Refresh compatibility
export default OrganizationProvider;
