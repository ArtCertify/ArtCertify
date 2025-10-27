import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRightOnRectangleIcon, 
  ChevronDownIcon, 
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { IPFSUrlService } from '../../services/ipfsUrlService';
import BackgroundLayout from './BackgroundLayout';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout, userAddress } = useAuth();
  const { organizationData } = useOrganization();

  // Helper function to truncate address
  const truncateAddress = (address: string | null, startChars: number, endChars: number): string => {
    if (!address || address.length < startChars + endChars) {
      return address || 'Non connesso';
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  };

  // Helper function to convert IPFS URL to gateway URL
  const getImageUrl = (ipfsUrl: string): string => {
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      return IPFSUrlService.getGatewayUrl(hash);
    }
    return ipfsUrl;
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleProfileEdit = () => {
    setUserMenuOpen(false);
    navigate('/profile');
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Force navigation to login page even if logout failed
      window.location.href = '/login';
    }
  };

  return (
    <BackgroundLayout 
      className="min-h-screen bg-slate-900"
      backgroundDensity="medium"
      backgroundOpacity="visible"
      fullScreen={true}
    >
      {/* Modern Header */}
      <header className="bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <img src="/logo.png" alt="ArtCertify Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-xl font-bold text-white">ArtCertify</span>
              </Link>

            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* User Avatar and Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  className="flex items-center space-x-3 rounded-lg p-2 text-sm font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  {organizationData ? (
                    <>
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <img 
                          src={getImageUrl(organizationData.image)} 
                          alt={organizationData.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <UserIcon className="h-4 w-4 text-white hidden" />
                      </div>
                      <div className="hidden sm:block text-left">
                        <div className="text-sm font-medium text-white">
                          {organizationData.name}
                        </div>
                        <div className="text-xs text-slate-400">Organizzazione</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="hidden sm:block text-left">
                        <div className="text-sm font-medium text-white">
                          {truncateAddress(userAddress, 4, 4)}
                        </div>
                        <div className="text-xs text-slate-400">Wallet</div>
                      </div>
                    </>
                  )}
                  <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-slate-700/95 backdrop-blur-sm py-2 shadow-xl ring-1 ring-slate-600/50 focus:outline-none">
                    <button
                      onClick={handleProfileEdit}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-600/50 hover:text-white transition-colors"
                    >
                      <BuildingOfficeIcon className="h-4 w-4" />
                      <span>Profilo</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-600/50 hover:text-white transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </BackgroundLayout>
  );
};

export default ResponsiveLayout;