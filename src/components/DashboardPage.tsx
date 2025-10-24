import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, FolderIcon } from '@heroicons/react/24/outline';
import ResponsiveLayout from './layout/ResponsiveLayout';
import { CertificateCard } from './CertificateCard';
import { ErrorMessage, SearchAndFilter, EmptyState } from './ui';
import { nftService } from '../services/nftService';
import { useAuth } from '../contexts/AuthContext';
import { useProjectsCache } from '../hooks/useProjectsCache';
import type { AssetInfo } from '../services/algorand';

// Project Card Component
interface ProjectCardProps {
  project: {
    name: string;
    certificates: AssetInfo[];
    count: number;
    latestDate: number;
  };
  onProjectClick?: (projectName: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onProjectClick }) => {
  const handleClick = () => {
    if (onProjectClick) {
      onProjectClick(project.name);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-blue-500/50 hover:bg-slate-800/80 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
    >
      {/* Header with Title and Icon */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-base font-bold text-white mb-1 group-hover:text-blue-100 transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
            {project.count} certificazione{project.count !== 1 ? 'i' : ''}
          </p>
        </div>
        
        {/* Project Icon */}
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <FolderIcon className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">CERTIFICATI</span>
          <span className="text-sm font-medium text-white group-hover:text-blue-100 transition-colors">
            {project.count}
          </span>
        </div>
      </div>
    </div>
  );
};

interface CertificationsPageState {
  certificates: AssetInfo[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filterProject: string;
  sortBy: string;
  viewMode: 'certificates' | 'projects';
}

export const DashboardPage: React.FC = () => {
  const { userAddress, isAuthenticated } = useAuth();
  const { getCachedProjects, setCachedProjects, clearProjectsCache } = useProjectsCache();
  const [state, setState] = useState<CertificationsPageState>({
    certificates: [],
    loading: true,
    error: null,
    searchTerm: '',
    filterProject: 'all',
    sortBy: 'date-desc',
    viewMode: 'projects'
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
        
        // Extract and cache project names
        const projectNames = new Set<string>();
        ownedNFTs.forEach(cert => {
          const projectName = extractProjectName(cert.params.name || '');
          if (projectName !== 'Senza Progetto') {
            projectNames.add(projectName);
          }
        });
        
        // Update cache with new project names
        setCachedProjects(userAddress, Array.from(projectNames).sort());
        
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
  }, [userAddress, isAuthenticated, setCachedProjects]);

  // Clear cache when user disconnects
  useEffect(() => {
    if (!isAuthenticated || !userAddress) {
      clearProjectsCache();
    }
  }, [isAuthenticated, userAddress, clearProjectsCache]);

  const handleSearch = (searchTerm: string) => {
    setState(prev => ({ ...prev, searchTerm }));
  };

  const handleFilterChange = (filterProject: string) => {
    setState(prev => ({ ...prev, filterProject }));
  };

  const handleSortChange = (sortBy: string) => {
    setState(prev => ({ ...prev, sortBy }));
  };

  const handleProjectClick = (projectName: string) => {
    setState(prev => ({
      ...prev,
      viewMode: 'certificates',
      filterProject: projectName,
      searchTerm: '' // Reset search when switching to certificates
    }));
  };

  const handleTabChange = (newViewMode: 'projects' | 'certificates') => {
    setState(prev => ({
      ...prev,
      viewMode: newViewMode,
      // Reset filters when switching tabs
      searchTerm: '',
      filterProject: 'all'
    }));
  };

  // Extract project name from title format "Project / File"
  const extractProjectName = (title: string): string => {
    if (!title) return 'Senza Progetto';
    
    const parts = title.split(' / ');
    if (parts.length === 2 && parts[0].trim()) {
      return parts[0].trim();
    }
    
    return 'Senza Progetto';
  };

  // Get unique projects from certificates (excluding "Senza Progetto")
  // Uses cache when available, otherwise extracts from current certificates
  const getUniqueProjects = (): string[] => {
    if (userAddress) {
      const cachedProjects = getCachedProjects(userAddress);
      if (cachedProjects.length > 0) {
        return cachedProjects;
      }
    }
    
    // Fallback to extracting from current certificates
    const projects = new Set<string>();
    state.certificates.forEach(cert => {
      const projectName = extractProjectName(cert.params.name || '');
      // Only include projects that are not "Senza Progetto"
      if (projectName !== 'Senza Progetto') {
        projects.add(projectName);
      }
    });
    return Array.from(projects).sort();
  };

  // Group certificates by project
  const getProjectsData = () => {
    const projectsMap = new Map<string, AssetInfo[]>();
    
    state.certificates.forEach(cert => {
      const projectName = extractProjectName(cert.params.name || '');
      if (projectName !== 'Senza Progetto') {
        if (!projectsMap.has(projectName)) {
          projectsMap.set(projectName, []);
        }
        projectsMap.get(projectName)!.push(cert);
      }
    });
    
    return Array.from(projectsMap.entries()).map(([projectName, certificates]) => ({
      name: projectName,
      certificates,
      count: certificates.length,
      latestDate: Math.max(...certificates.map(cert => {
        const creationTransaction = cert.creationTransaction as any;
        return creationTransaction?.roundTime || 
               creationTransaction?.['round-time'] || 
               creationTransaction?.confirmedRound || 
               creationTransaction?.['confirmed-round'] || 0;
      }))
    }));
  };

  // Filter and sort projects based on search and sort criteria
  const getFilteredAndSortedProjects = () => {
    let filtered = getProjectsData();

    // Apply search filter
    if (state.searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-desc':
          return b.latestDate - a.latestDate;
        case 'date-asc':
          return a.latestDate - b.latestDate;
        default:
          return 0;
      }
    });
  };

  // Filter and sort certificates
  const filteredAndSortedCertificates = React.useMemo(() => {
    // First filter: only show certificates with proper "Project / File" format
    let filtered = state.certificates.filter(cert => {
      const title = cert.params.name || '';
      // Only include certificates that have the " / " separator
      return title.includes(' / ');
    });

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

    // Apply project filter
    if (state.filterProject !== 'all') {
      filtered = filtered.filter(cert => {
        const projectName = extractProjectName(cert.params.name || '');
        return projectName === state.filterProject;
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (state.sortBy) {
        case 'date-desc': {
          const aRound = Number(a['created-at-round'] || 0);
          const bRound = Number(b['created-at-round'] || 0);
          return bRound - aRound;
        }
        case 'date-asc': {
          const aRound = Number(a['created-at-round'] || 0);
          const bRound = Number(b['created-at-round'] || 0);
          return aRound - bRound;
        }
        case 'name-asc':
          return (a.params.name || '').localeCompare(b.params.name || '');
        case 'name-desc':
          return (b.params.name || '').localeCompare(a.params.name || '');
        default:
          return 0;
      }
    });

    return sorted;
  }, [state.certificates, state.searchTerm, state.filterProject, state.sortBy]);

  const getEmptyStateMessage = () => {
    if (state.searchTerm || state.filterProject !== 'all') {
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
      <ResponsiveLayout>
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
      <ResponsiveLayout>
        <div className="space-y-6 relative pb-24">

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
          <button
            onClick={() => handleTabChange('projects')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              state.viewMode === 'projects'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Progetti
          </button>
          <button
            onClick={() => handleTabChange('certificates')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              state.viewMode === 'certificates'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Certificazioni
          </button>
        </div>

        {/* Search and Filters */}
        {state.viewMode === 'certificates' ? (
          <SearchAndFilter
            searchValue={state.searchTerm}
            onSearchChange={handleSearch}
            searchPlaceholder="Cerca per titolo, progetto..."
            filterValue={state.filterProject}
            onFilterChange={handleFilterChange}
            filterOptions={[
              { value: 'all', label: 'Tutti i Progetti' },
              ...getUniqueProjects().map(project => ({
                value: project,
                label: project
              }))
            ]}
            sortValue={state.sortBy}
            onSortChange={handleSortChange}
            sortOptions={[
              { value: 'date-desc', label: 'Dal più recente' },
              { value: 'date-asc', label: 'Dal meno recente' },
              { value: 'name-asc', label: 'A-Z' },
              { value: 'name-desc', label: 'Z-A' }
            ]}
            resultCount={!state.loading ? filteredAndSortedCertificates.length : undefined}
            onClearFilters={() => setState(prev => ({ ...prev, searchTerm: '', filterProject: 'all' }))}
            showClearFilters={state.searchTerm !== '' || state.filterProject !== 'all'}
          />
        ) : (
          <SearchAndFilter
            searchValue={state.searchTerm}
            onSearchChange={handleSearch}
            searchPlaceholder="Cerca per nome progetto..."
            sortValue={state.sortBy}
            onSortChange={handleSortChange}
            sortOptions={[
              { value: 'name-asc', label: 'A-Z' },
              { value: 'name-desc', label: 'Z-A' },
              { value: 'date-desc', label: 'Dal più recente' },
              { value: 'date-asc', label: 'Dal meno recente' }
            ]}
            resultCount={!state.loading ? getFilteredAndSortedProjects().length : undefined}
            onClearFilters={() => setState(prev => ({ ...prev, searchTerm: '' }))}
            showClearFilters={state.searchTerm !== ''}
          />
        )}

        {/* Content Grid */}
        {state.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <CertificateCard key={index} asset={{} as AssetInfo} loading={true} />
            ))}
          </div>
        ) : state.viewMode === 'certificates' ? (
            filteredAndSortedCertificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    onClick={() => setState(prev => ({ ...prev, searchTerm: '', filterProject: 'all' }))}
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
          )
          ) : (
            // Projects View
            getFilteredAndSortedProjects().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getFilteredAndSortedProjects().map((project) => (
                  <ProjectCard
                    key={project.name}
                    project={project}
                    onProjectClick={handleProjectClick}
                  />
                ))}
              </div>
            ) : (
            <EmptyState
              title="Nessun progetto trovato"
              description="Non hai ancora creato certificazioni con progetti associati."
              action={
                <Link
                  to="/certificates"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  Crea la tua prima certificazione
                </Link>
              }
            />
          )
        )}

        {/* Floating Create Button - Overlay */}
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50">
          <Link
            to="/certificates"
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 min-w-[280px] justify-center shadow-2xl"
          >
            <PlusIcon className="h-5 w-5" />
            Crea nuova Certificazione
          </Link>
        </div>
      </div>
    </ResponsiveLayout>
  );
}; 