import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ArrowRightOnRectangleIcon, 
  ChevronDownIcon, 
  BuildingOfficeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UsersIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Tooltip } from '../ui';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children, title = "Dettagli Certificazione" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, userAddress } = useAuth();

  // Helper function to truncate address
  const truncateAddress = (address: string | null, startChars: number, endChars: number): string => {
    if (!address || address.length < startChars + endChars) {
      return address || 'Non connesso';
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
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

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: <ChartBarIcon className="h-5 w-5" />, 
      tooltip: 'Panoramica generale delle certificazioni' 
    },
    { 
      name: 'Certificazioni', 
      href: '/certificates', 
      icon: <DocumentTextIcon className="h-5 w-5" />, 
      tooltip: 'Crea e gestisci certificazioni per documenti e artefatti' 
    },
    { 
      name: 'Ruoli', 
      href: '/roles', 
      icon: <UsersIcon className="h-5 w-5" />, 
      tooltip: 'Gestione ruoli e permessi utenti' 
    },
    { 
      name: 'Wallet', 
      href: '/wallet', 
      icon: <WalletIcon className="h-5 w-5" />, 
      tooltip: 'Visualizza saldo, transazioni e certificazioni del wallet' 
    },
  ];

  const isCurrentPath = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleProfileEdit = () => {
    setUserMenuOpen(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-slate-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-slate-800 border-r border-slate-700">
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <img src="/src/assets/logo.png" alt="ArtCertify Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-white font-semibold text-subsection-title">ArtCertify</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <nav className="mt-4 px-2">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Tooltip content={item.tooltip} position="right">
                    <Link
                      to={item.href}
                      className={`flex items-center w-full px-3 py-3 text-body-secondary font-medium rounded-lg transition-colors ${
                        isCurrentPath(item.href)
                          ? 'bg-primary-600 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="mr-3 flex-shrink-0">{item.icon}</span>
                      {item.name}
                    </Link>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-slate-800 border-r border-slate-700">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b border-slate-700">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3">
              <img src="/src/assets/logo.png" alt="ArtCertify Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-white font-semibold text-subsection-title">ArtCertify</span>
          </div>

          {/* Navigation */}
          <nav className="mt-4 flex-1 px-2">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Tooltip content={item.tooltip} position="right">
                    <Link
                      to={item.href}
                      className={`flex items-center w-full px-3 py-3 text-body-secondary font-medium rounded-lg transition-colors ${
                        isCurrentPath(item.href)
                          ? 'bg-primary-600 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <span className="mr-3 flex-shrink-0">{item.icon}</span>
                      {item.name}
                    </Link>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-40 bg-slate-900 border-b border-slate-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Left side - Mobile menu button and title */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-400 hover:text-white mr-4"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              
              {/* Title without back button */}
              <div className="flex items-center">
                <h1 className="text-section-title text-white">{title}</h1>
              </div>
            </div>

            {/* Right side - Organization menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">MR</span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-medium text-white font-mono">
                      {truncateAddress(userAddress, 4, 3)}
                    </div>
                    <div className="text-xs text-slate-400">Museo Arte</div>
                  </div>
                </div>
                <ChevronDownIcon className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-slate-700">
                    <p className="text-xs font-medium text-white font-mono">
                      {truncateAddress(userAddress, 6, 4)}
                    </p>
                    <p className="text-xs text-slate-400">Museo Arte • Roma</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleProfileEdit}
                      className="flex items-center w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <BuildingOfficeIcon className="h-4 w-4 mr-3" />
                      Modifica Organizzazione
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResponsiveLayout; 