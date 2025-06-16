import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, PlusIcon } from '@heroicons/react/24/outline';
import ResponsiveLayout from './layout/ResponsiveLayout';
import { CertificateCard } from './CertificateCard';
import ErrorMessage from './ui/ErrorMessage';
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-page-title text-white">Dashboard</h1>
            <p className="text-slate-400 text-body-regular mt-1">
              Visualizza e gestisci le tue certificazioni per documenti e artefatti
            </p>
          </div>
          
          <Link
            to="/certificates"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            <PlusIcon className="h-5 w-5" />
            Crea nuova Certificazione
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cerca per titolo, autore..."
                  value={state.searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-slate-400" />
                <select
                  value={state.filterType}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tutti</option>
                  <option value="document">Documenti</option>
                  <option value="artefatto">Artefatti</option>
                  <option value="sbt">SBT</option>
                </select>
              </div>

              <select
                value={state.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date-desc">Data decrescente</option>
                <option value="date-asc">Data crescente</option>
                <option value="name-asc">Nome A-Z</option>
                <option value="name-desc">Nome Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {!state.loading && (
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">
              {filteredAndSortedCertificates.length} certificazioni trovate
            </p>
            
            {(state.searchTerm || state.filterType !== 'all') && (
              <button
                onClick={() => setState(prev => ({ ...prev, searchTerm: '', filterType: 'all' }))}
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Cancella filtri
              </button>
            )}
          </div>
        )}

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
          /* Empty State */
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              {emptyState.title}
            </h3>
            
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              {emptyState.description}
            </p>
            
            {emptyState.showFilters ? (
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
             )}
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
}; 