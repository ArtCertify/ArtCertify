import React, { useState, useEffect } from 'react';
import ResponsiveLayout from './layout/ResponsiveLayout';
import { 
  ErrorMessage, 
  Button, 
  Badge,
  StatusBadge,
  EmptyState,
  PageHeader,
  LoadingSpinner,
  TabsContainer
} from './ui';
import { walletService, type WalletInfo, type WalletTransaction } from '../services/walletService';
import { algorandService } from '../services/algorand';
import { useAuth } from '../contexts/AuthContext';
import { config } from '../config/environment';
import {
  WalletIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  Squares2X2Icon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  PlusCircleIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import Card from './ui/Card';

interface WalletPageState {
  walletInfo: WalletInfo | null;
  loading: boolean;
  error: string | null;
  showBalance: boolean;
  refreshing: boolean;
  activeTab: 'transactions' | 'assets';
}

export const WalletPage: React.FC = () => {
  const { userAddress } = useAuth();
  const [state, setState] = useState<WalletPageState>({
    walletInfo: null,
    loading: false,
    error: null,
    showBalance: true,
    refreshing: false,
    activeTab: 'transactions'
  });

  const fetchWalletData = async (showLoading = true) => {
    if (!userAddress) return;

    setState(prev => ({ 
      ...prev, 
      loading: showLoading, 
      refreshing: !showLoading,
      error: null 
    }));

    try {
      const walletInfo = await walletService.getWalletInfo(userAddress);
      setState(prev => ({ 
        ...prev, 
        walletInfo, 
        loading: false, 
        refreshing: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Errore nel caricamento wallet',
        loading: false,
        refreshing: false
      }));
    }
  };

  useEffect(() => {
    if (userAddress) {
      fetchWalletData();
    }
  }, [userAddress]);

  const toggleBalanceVisibility = () => {
    setState(prev => ({ ...prev, showBalance: !prev.showBalance }));
  };

  const copyAddress = () => {
    if (userAddress) {
      navigator.clipboard.writeText(userAddress);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  // Componente per account vuoti
  const EmptyAccountCard = () => {
    if (!state.walletInfo?.isEmptyAccount) return null;

    return (
      <Card className="border-amber-500/30 bg-amber-500/5 mb-6">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Account Nuovo Rilevato
              </h3>
              <p className="text-slate-300 mb-4">
                Questo wallet non ha ancora interagito con la blockchain Algorand. 
                Per utilizzare ArtCertify e creare certificazioni, è necessario avere almeno 0.1 ALGO per le commissioni di transazione.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <BanknotesIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Saldo minimo richiesto: 0.1 ALGO</span>
                </div>
                
                                 <div className="flex flex-wrap gap-2">
                   {config.network.isTestnet && (
                     <Button
                       size="sm"
                       variant="secondary"
                       onClick={() => window.open('https://dispenser.testnet.aws.algodev.network/', '_blank')}
                       className="bg-blue-600 hover:bg-blue-700"
                     >
                       <PlusCircleIcon className="w-4 h-4 mr-2" />
                       Ottieni ALGO Testnet
                     </Button>
                   )}
                   
                   {config.network.isMainnet && (
                     <Button
                       size="sm"
                       variant="secondary"
                       onClick={() => window.open('https://www.moonpay.com/buy/algo', '_blank')}
                     >
                       <BanknotesIcon className="w-4 h-4 mr-2" />
                       Acquista ALGO
                     </Button>
                   )}
                   
                   <Button
                     size="sm"
                     variant="tertiary"
                     onClick={() => fetchWalletData(false)}
                     disabled={state.refreshing}
                   >
                     {state.refreshing ? <LoadingSpinner size="sm" /> : 'Ricarica'}
                   </Button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Quick stats component
  const QuickStats = () => {
    if (!state.walletInfo) return null;

    // Se è un account vuoto, mostra statistiche semplificate
    if (state.walletInfo.isEmptyAccount) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <Squares2X2Icon className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-slate-400 text-sm">Certificazioni</p>
                <p className="text-slate-500 font-semibold">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <WalletIcon className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-slate-400 text-sm">Saldo</p>
                <p className="text-slate-500 font-semibold">0 ALGO</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <button
                onClick={copyAddress}
                className="flex items-center gap-3 hover:bg-slate-700 rounded p-1 transition-colors w-full"
                title="Copia indirizzo"
              >
                <DocumentDuplicateIcon className="h-5 w-5 text-slate-400" />
                <div className="text-left">
                  <p className="text-slate-400 text-sm">Account</p>
                  <p className="text-white font-mono text-sm">{formatAddress(userAddress || '')}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <Squares2X2Icon className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-slate-400 text-sm">Certificazioni</p>
              <p className="text-white font-semibold">{state.walletInfo.totalAssetsOptedIn}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <WalletIcon className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-slate-400 text-sm">Saldo Minimo</p>
              <p className="text-white font-semibold">
                {walletService.formatAlgo(state.walletInfo.minBalance / 1_000_000)} ALGO
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <button
              onClick={copyAddress}
              className="flex items-center gap-3 hover:bg-slate-700 rounded p-1 transition-colors w-full"
              title="Copia indirizzo"
            >
              <DocumentDuplicateIcon className="h-5 w-5 text-slate-400" />
              <div className="text-left">
                <p className="text-slate-400 text-sm">Account</p>
                <p className="text-white font-mono text-sm">{formatAddress(userAddress || '')}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Balance card component
  const BalanceCard = () => {
    if (!state.walletInfo) return null;

    // Per account vuoti, mostra una card semplificata
    if (state.walletInfo.isEmptyAccount) {
      return (
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-600/50 rounded-lg">
                <WalletIcon className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Saldo Disponibile</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchWalletData(false)}
                disabled={state.refreshing}
                className="p-2 hover:bg-slate-600 rounded-lg transition-colors text-slate-400 hover:text-white disabled:opacity-50"
                title="Aggiorna"
              >
                <ArrowPathIcon className={`h-5 w-5 ${state.refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-400">0.000</span>
            <span className="text-slate-500 text-lg font-medium">ALGO</span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-6 border border-primary-700 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-lg">
              <WalletIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Saldo Disponibile</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleBalanceVisibility}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
              title={state.showBalance ? "Nascondi saldo" : "Mostra saldo"}
            >
              {state.showBalance ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => fetchWalletData(false)}
              disabled={state.refreshing}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white disabled:opacity-50"
              title="Aggiorna"
            >
              <ArrowPathIcon className={`h-5 w-5 ${state.refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            {state.showBalance ? 
              `${walletService.formatAlgo(state.walletInfo.balance.algo)}` : 
              '••••••'
            }
          </span>
          <span className="text-white/80 text-lg font-medium">ALGO</span>
        </div>
      </div>
    );
  };

  // Transaction item component
  const TransactionItem = ({ transaction }: { transaction: WalletTransaction }) => {
    const isOutgoing = transaction.sender === userAddress;
    
    return (
      <div className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors border border-slate-600/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {isOutgoing ? (
                <ArrowUpIcon className="h-4 w-4 text-red-400" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-green-400" />
              )}
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {transaction.type === 'pay' ? 'Pagamento' : transaction.type}
              </p>
              <p className="text-slate-400 text-xs">
                {transaction.timestamp ? 
                  new Date(transaction.timestamp * 1000).toLocaleDateString('it-IT') : 
                  `Round ${transaction.round}`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className={`font-medium text-sm ${isOutgoing ? 'text-red-400' : 'text-green-400'}`}>
                {isOutgoing ? '-' : '+'}
                {walletService.formatAlgo(transaction.amount)} ALGO
              </p>
              <p className="text-slate-400 text-xs">Fee: {walletService.formatAlgo(transaction.fee)}</p>
            </div>
            <a
              href={algorandService.getTransactionExplorerUrl(transaction.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-slate-600 rounded transition-colors"
              title="Visualizza su explorer"
            >
              <LinkIcon className="h-4 w-4 text-slate-400 hover:text-white" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  // Asset item component
  const AssetItem = ({ asset }: { asset: any }) => {
    return (
      <div className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors border border-slate-600/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <Squares2X2Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">{asset.name || `Asset #${asset.assetId}`}</p>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                {asset.unitName && <Badge size="sm">{asset.unitName}</Badge>}
                <span>ID: {asset.assetId}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white font-medium">{asset.amount}</p>
              <StatusBadge status="success" label="Soulbound" size="sm" />
            </div>
            <a
              href={algorandService.getAssetExplorerUrl(Number(asset.assetId))}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-slate-600 rounded transition-colors"
              title="Visualizza su explorer"
            >
              <LinkIcon className="h-4 w-4 text-slate-400 hover:text-white" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  if (state.loading) {
    return (
      <ResponsiveLayout title="Wallet">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </ResponsiveLayout>
    );
  }

  if (state.error) {
    return (
      <ResponsiveLayout title="Wallet">
        <ErrorMessage 
          message={state.error}
          onRetry={() => fetchWalletData()}
        />
      </ResponsiveLayout>
    );
  }

  if (!state.walletInfo) {
    return (
      <ResponsiveLayout title="Wallet">
        <EmptyState
          title="Wallet non trovato"
          description="Non è possibile accedere alle informazioni del wallet"
          action={
            <Button onClick={() => fetchWalletData()}>
              Riprova
            </Button>
          }
        />
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        <PageHeader
          title="Gestione Wallet"
          description="Visualizza saldo, transazioni e certificazioni del tuo account Algorand"
          actions={
            <Button 
              onClick={() => fetchWalletData(false)}
              disabled={state.refreshing}
              variant="secondary"
            >
              {state.refreshing ? <LoadingSpinner size="sm" /> : 'Aggiorna'}
            </Button>
          }
        />

        <EmptyAccountCard />
                 <BalanceCard />
         <QuickStats />

         {/* Tabs Container */}
         <TabsContainer
           tabs={[
             {
               id: 'transactions',
               label: 'Transazioni Recenti',
               content: (
                 <div>
                   {state.walletInfo.recentTransactions.length === 0 ? (
                     <EmptyState
                       title="Nessuna transazione"
                       description="Le tue transazioni appariranno qui"
                       variant="compact"
                     />
                   ) : (
                     <div className="space-y-3">
                       {state.walletInfo.recentTransactions.slice(0, 5).map((transaction) => (
                         <TransactionItem key={transaction.id} transaction={transaction} />
                       ))}
                     </div>
                   )}
                 </div>
               )
             },
             {
               id: 'assets',
               label: 'Certificazioni',
               content: (
                 <div>
                   {state.walletInfo.assets.length === 0 ? (
                     <EmptyState
                       title="Nessuna certificazione"
                       description="Le tue certificazioni appariranno qui"
                       variant="compact"
                     />
                   ) : (
                     <div className="space-y-3">
                       {state.walletInfo.assets.map((asset) => (
                         <AssetItem key={asset.assetId} asset={asset} />
                       ))}
                     </div>
                   )}
                 </div>
               )
             }
           ]}
           activeTab={state.activeTab}
           onTabChange={(tabId) => setState(prev => ({ ...prev, activeTab: tabId as 'transactions' | 'assets' }))}
           variant="pills"
           responsive={true}
         />
      </div>
    </ResponsiveLayout>
  );
};

export default WalletPage; 