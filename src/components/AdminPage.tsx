import React, { useState, useEffect } from 'react';
import { adminService, type Organization, type CreateOrganizationRequest } from '../services/adminService';
import { Input, Button, Card, Alert } from './ui';
import BackgroundLayout from './layout/BackgroundLayout';
import { 
  BuildingOfficeIcon, 
  PlusIcon, 
  ArrowRightOnRectangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Organizations state
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Create organization form state
  const [formData, setFormData] = useState<CreateOrganizationRequest>({
    address: '',
    name: '',
    description: '',
    website: '',
    contactEmail: '',
    enabled: true
  });
  const [isCreating, setIsCreating] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState<string | null>(null);

  // Check if already authenticated on mount
  useEffect(() => {
    if (adminService.isAdminAuthenticated()) {
      setIsAuthenticated(true);
      loadOrganizations();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);

    try {
      await adminService.loginWithKeycloak(username, password);
      setIsAuthenticated(true);
      setUsername('');
      setPassword('');
      await loadOrganizations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    adminService.clearAdminTokens();
    setIsAuthenticated(false);
    setOrganizations([]);
    setShowCreateForm(false);
    setFormData({
      address: '',
      name: '',
      description: '',
      website: '',
      contactEmail: '',
      enabled: true
    });
  };

  const loadOrganizations = async () => {
    setIsLoadingOrganizations(true);
    setError(null);
    
    try {
      const orgs = await adminService.getOrganizations();
      setOrganizations(orgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle organizzazioni');
      if (err instanceof Error && err.message.includes('Sessione scaduta')) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoadingOrganizations(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCreating(true);

    try {
      await adminService.createOrganization(formData);
      setFormData({
        address: '',
        name: '',
        description: '',
        website: '',
        contactEmail: '',
        enabled: true
      });
      setShowCreateForm(false);
      await loadOrganizations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella creazione dell\'organizzazione');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteOrganization = async (address: string, name?: string) => {
    const orgName = name || address;
    const confirmMessage = `Sei sicuro di voler eliminare l'organizzazione "${orgName}"?\n\nQuesta azione non può essere annullata.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setError(null);
    setDeletingAddress(address);

    try {
      await adminService.deleteOrganization(address);
      await loadOrganizations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella cancellazione dell\'organizzazione');
    } finally {
      setDeletingAddress(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('it-IT');
    } catch {
      return dateString;
    }
  };

  if (!isAuthenticated) {
    return (
      <BackgroundLayout 
        className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center px-4 py-8 sm:py-12"
        backgroundDensity="low"
        backgroundOpacity="subtle"
        fullScreen={true}
      >
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                <img src="/logo.png" alt="ArtCertify Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">ArtCertify Admin</span>
            </div>
            <p className="text-slate-300 text-sm sm:text-base">
              Area amministrativa
            </p>
          </div>

          <Card className="bg-slate-800/80 backdrop-blur-sm shadow-2xl" padding="lg">
            <form onSubmit={handleLogin} className="space-y-6 sm:space-y-8">
              <div className="mb-2">
                <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-2">Login</h2>
                <p className="text-slate-400 text-sm sm:text-base">
                  Inserisci le tue credenziali per accedere
                </p>
              </div>

              {error && (
                <Alert variant="error" className="mb-2">
                  {error}
                </Alert>
              )}

              <div className="space-y-5 sm:space-y-6">
                <div className="[&_input]:py-3 [&_input]:sm:py-4 [&_input]:text-base [&_input]:sm:text-lg">
                  <Input
                    label="Email / Username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoggingIn}
                    placeholder="Inserisci username o email"
                  />
                </div>

                <div className="[&_input]:py-3 [&_input]:sm:py-4 [&_input]:text-base [&_input]:sm:text-lg">
                  <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoggingIn}
                    placeholder="Inserisci password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full text-base sm:text-lg py-3 sm:py-4"
                  loading={isLoggingIn}
                  disabled={isLoggingIn || !username || !password}
                >
                  Accedi
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </BackgroundLayout>
    );
  }

  return (
    <BackgroundLayout 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900"
      backgroundDensity="low"
      backgroundOpacity="subtle"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">Admin Panel</h1>
            <p className="text-slate-400 text-sm sm:text-base">Gestione organizzazioni</p>
          </div>
          <Button
            variant="secondary"
            onClick={handleLogout}
            icon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
            className="w-full sm:w-auto"
          >
            Logout
          </Button>
        </div>

        {error && (
          <Alert variant="error" className="mb-4 sm:mb-6">
            {error}
          </Alert>
        )}

        {/* Create Organization Form */}
        {showCreateForm ? (
          <Card className="mb-6 sm:mb-8" padding="lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">Crea Nuova Organizzazione</h2>
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({
                    address: '',
                    name: '',
                    description: '',
                    website: '',
                    contactEmail: '',
                    enabled: true
                  });
                }}
                className="w-full sm:w-auto"
              >
                Annulla
              </Button>
            </div>

            <form onSubmit={handleCreateOrganization} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Input
                  label="Indirizzo Algorand *"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  disabled={isCreating}
                  placeholder="A2SSBHKRNJV7CD5NJEP5UUYUSYJA3LHXK4PBQKQV7XOGE7OGUIHQGJWLBQ"
                />

                <Input
                  label="Nome"
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isCreating}
                  placeholder="Nome organizzazione"
                />

                <Input
                  label="Email di contatto"
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  disabled={isCreating}
                  placeholder="email@example.com"
                />

                <Input
                  label="Website"
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  disabled={isCreating}
                  placeholder="https://example.com"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-label-form text-slate-300 mb-2">
                  Descrizione
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isCreating}
                  placeholder="Descrizione dell'organizzazione"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled ?? true}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  disabled={isCreating}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 bg-slate-700 border-slate-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="enabled" className="text-slate-300 text-sm sm:text-base">
                  Abilitata
                </label>
              </div>

              <div className="flex gap-3 sm:col-span-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                  loading={isCreating}
                  disabled={isCreating || !formData.address}
                >
                  Crea Organizzazione
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <div className="mb-6">
            <Button
              variant="primary"
              onClick={() => setShowCreateForm(true)}
              icon={<PlusIcon className="w-5 h-5" />}
              className="w-full sm:w-auto"
              size="lg"
            >
              Crea Nuova Organizzazione
            </Button>
          </div>
        )}

        {/* Organizations List */}
        <Card padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white flex items-center gap-2">
              <BuildingOfficeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Organizzazioni <span className="text-slate-400">({organizations.length})</span></span>
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadOrganizations}
              loading={isLoadingOrganizations}
              icon={<ArrowPathIcon className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Aggiorna
            </Button>
          </div>

          {isLoadingOrganizations ? (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-white"></div>
              <p className="text-slate-400 mt-4 text-sm sm:text-base">Caricamento organizzazioni...</p>
            </div>
          ) : organizations.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <BuildingOfficeIcon className="w-16 h-16 sm:w-20 sm:h-20 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm sm:text-base">Nessuna organizzazione trovata</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-300 font-medium text-sm">Indirizzo</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium text-sm">Nome</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium text-sm">Descrizione</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium text-sm">Email</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium text-sm">Website</th>
                      <th className="text-center py-3 px-4 text-slate-300 font-medium text-sm">Stato</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium text-sm">Aggiornato</th>
                      <th className="text-center py-3 px-4 text-slate-300 font-medium text-sm">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.map((org, index) => (
                      <tr 
                        key={org.address} 
                        className={`border-b border-slate-700/50 ${index % 2 === 0 ? 'bg-slate-800/30' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <code className="text-xs text-slate-300 font-mono break-all">
                            {org.address}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-white text-sm">
                          {org.name || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-sm">
                          <span className="line-clamp-2">{org.description || '-'}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-sm">
                          {org.contactEmail || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-sm">
                          {org.website ? (
                            <a 
                              href={org.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline break-all"
                            >
                              {org.website}
                            </a>
                          ) : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {org.enabled ? (
                            <span className="inline-flex items-center gap-1 text-green-400">
                              <CheckCircleIcon className="w-4 h-4" />
                              <span className="text-xs">Abilitata</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400">
                              <XCircleIcon className="w-4 h-4" />
                              <span className="text-xs">Disabilitata</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-xs">
                          {formatDate(org.updatedAt)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteOrganization(org.address, org.name)}
                            disabled={deletingAddress === org.address}
                            loading={deletingAddress === org.address}
                            icon={<TrashIcon className="w-4 h-4" />}
                          >
                            Elimina
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-4">
                {organizations.map((org) => (
                  <Card key={org.address} className="bg-slate-800/50" padding="md">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm sm:text-base mb-1 truncate">
                            {org.name || 'Senza nome'}
                          </h3>
                          <code className="text-xs text-slate-400 font-mono break-all">
                            {org.address}
                          </code>
                        </div>
                        <div className="flex-shrink-0">
                          {org.enabled ? (
                            <span className="inline-flex items-center gap-1 text-green-400">
                              <CheckCircleIcon className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400">
                              <XCircleIcon className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </div>

                      {org.description && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Descrizione</p>
                          <p className="text-sm text-slate-300">{org.description}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {org.contactEmail && (
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Email</p>
                            <p className="text-slate-300 break-all">{org.contactEmail}</p>
                          </div>
                        )}
                        {org.website && (
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Website</p>
                            <a 
                              href={org.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline break-all"
                            >
                              {org.website}
                            </a>
                          </div>
                        )}
                        {org.updatedAt && (
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Aggiornato</p>
                            <p className="text-slate-300 text-xs">{formatDate(org.updatedAt)}</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-700">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteOrganization(org.address, org.name)}
                          disabled={deletingAddress === org.address}
                          loading={deletingAddress === org.address}
                          icon={<TrashIcon className="w-4 h-4" />}
                          className="w-full"
                        >
                          Elimina
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </BackgroundLayout>
  );
};

