import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import ResponsiveLayout from './layout/ResponsiveLayout';
import { CertificateCard } from './CertificateCard';
import { ErrorMessage, SearchAndFilter, EmptyState } from './ui';
import { nftService } from '../services/nftService';
import { useAuth } from '../contexts/AuthContext';
import type { AssetInfo } from '../services/algorand';

interface CertificationsPageState {
  certificates: AssetInfo[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filterType: string;
  sortBy: string;
}

export const DashboardPage: React.FC = () => {
  const { userAddress, isAuthenticated } = useAuth();
  const [state, setState] = useState<CertificationsPageState>({
    certificates: [],
    loading: true,
    error: null,
    searchTerm: '',
    filterType: 'all',
    sortBy: 'date-desc'
  });

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!isAuthenticated || !userAddress) {
        setState(prev => ({ ...prev, loading: false, certificates: [] }));
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // Fetch NFTs owned by the user address
        const ownedNFTs = await nftService.getOwnedNFTs(userAddress);
        
        setState(prev => ({
          ...prev,
          certificates: ownedNFTs,
          loading: false
        }));
      } catch (error) {
        console.error('Error fetching certificates:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to fetch certificates',
          loading: false
        }));
      }
    };

    fetchCertificates();
  }, [userAddress, isAuthenticated]);

  const handleSearch = (searchTerm: string) => {
    setState(prev => ({ ...prev, searchTerm }));
  };

  const handleFilterChange = (filterType: string) => {
    setState(prev => ({ ...prev, filterType }));
  };

  const handleSortChange = (sortBy: string) => {
    setState(prev => ({ ...prev, sortBy }));
  };

  // Filter and sort certificates
  const filteredAndSortedCertificates = React.useMemo(() => {
    let filtered = state.certificates;

    // Apply search filter
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      filtered = filtered.filter(cert => 
        cert.params.name?.toLowerCase().includes(searchLower) ||
        cert.index.toString().includes(searchLower) ||
        cert.params.creator.toLowerCase().includes(searchLower) ||
        cert.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (state.filterType !== 'all') {
      filtered = filtered.filter(cert => {
        const name = cert.params.name?.toLowerCase() || '';
        switch (state.filterType) {
          case 'document':
            return name.includes('document') || (!name.includes('artefatto') && !name.includes('sbt'));
          case 'artefatto':
            return name.includes('artefatto');
          case 'sbt':
            return name.includes('sbt');
          default:
            return true;
        }
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (state.sortBy) {
        case 'date-desc':
          return (b['created-at-round'] || 0) - (a['created-at-round'] || 0);
        case 'date-asc':
          return (a['created-at-round'] || 0) - (b['created-at-round'] || 0);
        case 'name-asc':
          return (a.params.name || '').localeCompare(b.params.name || '');
        case 'name-desc':
          return (b.params.name || '').localeCompare(a.params.name || '');
        default:
          return 0;
      }
    });

    return sorted;
  }, [state.certificates, state.searchTerm, state.filterType, state.sortBy]);

  const getEmptyStateMessage = () => {
    if (state.searchTerm || state.filterType !== 'all') {
      return {
        title: 'Nessun risultato trovato',
        description: 'Prova a modificare i filtri di ricerca o a cercare con termini diversi.',
        showFilters: true
      };
    }
    
    return {
      title: 'Nessuna certificazione trovata',
      description: 'Non hai ancora creato nessuna certificazione. Inizia creando la tua prima certificazione per artefatti o documenti.',
      showFilters: false
    };
  };

  const emptyState = getEmptyStateMessage();

  if (state.error) {
    return (
      <ResponsiveLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <ErrorMessage 
            message={state.error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout title="Dashboard">
      <div className="space-y-6">
        {/* Description and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-slate-400 text-sm">
            Visualizza e gestisci le tue certificazioni per documenti e artefatti
          </p>
          <Link
            to="/certificates"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            <PlusIcon className="h-5 w-5" />
            Crea nuova Certificazione
          </Link>
        </div>

        {/* Search and Filters */}
        <SearchAndFilter
          searchValue={state.searchTerm}
          onSearchChange={handleSearch}
          searchPlaceholder="Cerca per titolo, autore..."
          filterValue={state.filterType}
          onFilterChange={handleFilterChange}
          filterOptions={[
            { value: 'all', label: 'Tutti' },
            { value: 'document', label: 'Documenti' },
            { value: 'artefatto', label: 'Artefatti' },
            { value: 'sbt', label: 'SBT' }
          ]}
          sortValue={state.sortBy}
          onSortChange={handleSortChange}
          sortOptions={[
            { value: 'date-desc', label: 'Data decrescente' },
            { value: 'date-asc', label: 'Data crescente' },
            { value: 'name-asc', label: 'Nome A-Z' },
            { value: 'name-desc', label: 'Nome Z-A' }
          ]}
          resultCount={!state.loading ? filteredAndSortedCertificates.length : undefined}
          onClearFilters={() => setState(prev => ({ ...prev, searchTerm: '', filterType: 'all' }))}
          showClearFilters={state.searchTerm !== '' || state.filterType !== 'all'}
        />

        {/* Certificates Grid */}
        {state.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <CertificateCard key={index} asset={{} as AssetInfo} loading={true} />
            ))}
          </div>
        ) : filteredAndSortedCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSortedCertificates.map((certificate) => (
              <CertificateCard
                key={certificate.index}
                asset={certificate}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={emptyState.title}
            description={emptyState.description}
            action={
              emptyState.showFilters ? (
                <button
                  onClick={() => setState(prev => ({ ...prev, searchTerm: '', filterType: 'all' }))}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                >
                  Cancella filtri
                </button>
              ) : (
                <Link
                  to="/certificates"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  Crea la tua prima certificazione
                </Link>
              )
            }
          />
        )}
      </div>
    </ResponsiveLayout>
  );
}; 