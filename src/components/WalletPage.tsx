import React, { useState, useEffect } from 'react';
import ResponsiveLayout from './layout/ResponsiveLayout';
import { ErrorMessage, Button, Card, Tooltip, TabsContainer, TruncatedText } from './ui';
import { walletService, type WalletInfo, type WalletTransaction } from '../services/walletService';
import { useAuth } from '../contexts/AuthContext';
import {
  WalletIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  Squares2X2Icon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface WalletPageState {
  walletInfo: WalletInfo | null;
  loading: boolean;
  error: string | null;
  showBalance: boolean;
  activeTab: 'overview' | 'transactions' | 'assets';
  refreshing: boolean;
}

export const WalletPage: React.FC = () => {
  const { userAddress, isAuthenticated } = useAuth();
  const [state, setState] = useState<WalletPageState>({
    walletInfo: null,
    loading: true,
    error: null,
    showBalance: true,
    activeTab: 'overview',
    refreshing: false
  });

  const fetchWalletData = async (showLoading = true) => {
    if (!userAddress || !isAuthenticated) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Wallet non connesso'
      }));
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        loading: showLoading,
        refreshing: !showLoading,
        error: null
      }));

      const walletInfo = await walletService.getWalletInfo(userAddress);
      
      setState(prev => ({
        ...prev,
        walletInfo,
        loading: false,
        refreshing: false
      }));
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Errore nel caricamento dei dati del wallet',
        loading: false,
        refreshing: false
      }));
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [userAddress, isAuthenticated]);

  const toggleBalanceVisibility = () => {
    setState(prev => ({
      ...prev,
      showBalance: !prev.showBalance
    }));
  };

  const copyAddress = () => {
    if (userAddress) {
      navigator.clipboard.writeText(userAddress);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const formatTransactionType = (type: string) => {
    const types: Record<string, string> = {
      'payment': 'Pagamento',
      'asset-transfer': 'Trasferimento Asset',
      'app-call': 'Chiamata App',
      'asset-config': 'Config Asset',
      'unknown': 'Sconosciuto'
    };
    return types[type] || type;
  };

  const getTransactionIcon = (transaction: WalletTransaction) => {
    if (transaction.sender === userAddress) {
      return <ArrowUpIcon className="h-4 w-4 text-red-400" />;
    } else {
      return <ArrowDownIcon className="h-4 w-4 text-green-400" />;
    }
  };

  const renderBalanceCard = () => {
    if (!state.walletInfo) return null;

    const { balance } = state.walletInfo;

    return (
      <Card 
        variant="elevated" 
        className="bg-gradient-to-br from-primary-600 to-primary-800 border-primary-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-subsection-title text-white">Saldo Disponibile</h3>
              <Tooltip content="Il saldo disponibile è l'importo di ALGO che puoi utilizzare per transazioni, escluso il saldo minimo richiesto">
                <InformationCircleIcon className="h-4 w-4 text-primary-200 cursor-help" />
              </Tooltip>
            </div>
            <p className="text-primary-200 text-body-secondary flex items-center gap-2 mt-1">
              {formatAddress(userAddress!)}
              <Tooltip content="Copia l'indirizzo del wallet negli appunti">
                <button
                  onClick={copyAddress}
                  className="p-1 hover:bg-primary-500 rounded transition-colors"
                >
                  <DocumentDuplicateIcon className="h-3 w-3" />
                </button>
              </Tooltip>
            </p>
          </div>
          <Tooltip content={state.showBalance ? "Nascondi il saldo per privacy" : "Mostra il saldo del wallet"}>
            <button
              onClick={toggleBalanceVisibility}
              className="p-2 hover:bg-primary-500 rounded-lg transition-colors"
            >
              {state.showBalance ? (
                <EyeSlashIcon className="h-5 w-5 text-white" />
              ) : (
                <EyeIcon className="h-5 w-5 text-white" />
              )}
            </button>
          </Tooltip>
        </div>

        <div className="text-3xl font-bold text-white">
          {state.showBalance ? (
            <>
              {walletService.formatAlgo(balance.algo)} <span className="text-xl text-primary-200">ALGO</span>
            </>
          ) : (
            '••••••'
          )}
        </div>
        {state.showBalance && balance.eurValue && balance.eurValue > 0 && (
          <div className="text-primary-200 mt-1 text-body-regular">
            ≈ {walletService.formatEur(balance.eurValue)}
          </div>
        )}
      </Card>
    );
  };

  const renderStats = () => {
    if (!state.walletInfo) return null;

    const stats = [
      {
        label: 'Certificazioni Soulbound',
        value: state.walletInfo.totalAssetsOptedIn,
        icon: <Squares2X2Icon className="h-4 w-4" />,
        tooltip: 'Numero di certificazioni NFT soulbound associate al tuo wallet. Queste certificazioni non possono essere trasferite.'
      },
      {
        label: 'Saldo Minimo',
        value: `${walletService.formatAlgo(state.walletInfo.minBalance / 1_000_000)} ALGO`,
        icon: <WalletIcon className="h-4 w-4" />,
        tooltip: 'Saldo minimo richiesto da Algorand per mantenere il wallet attivo. Questo importo non può essere utilizzato per transazioni.'
      }
    ];

    return (
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <Card key={index} variant="default" padding="sm" hover>
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                {stat.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-body-secondary text-slate-400">{stat.label}</p>
                  <Tooltip content={stat.tooltip}>
                    <InformationCircleIcon className="h-3 w-3 text-slate-500 cursor-help" />
                  </Tooltip>
                </div>
                <p className="text-body-regular font-semibold text-white">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderTransactions = () => {
    if (!state.walletInfo?.recentTransactions.length) {
      return (
        <Card variant="default" padding="lg">
          <div className="text-center">
            <ClockIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-subsection-title text-white mb-2">Nessuna transazione</h3>
            <p className="text-body-regular text-slate-400">Le tue transazioni recenti appariranno qui quando effettuerai operazioni con ALGO.</p>
          </div>
        </Card>
      );
    }

    return (
      <Card 
        variant="default" 
        title="Transazioni Recenti"
        icon={<ClockIcon className="h-5 w-5" />}
        actions={
          <Tooltip content="Mostra solo le 5 transazioni più recenti">
            <InformationCircleIcon className="h-4 w-4 text-slate-400 cursor-help" />
          </Tooltip>
        }
      >
        <div className="space-y-3">
          {state.walletInfo.recentTransactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tooltip content={transaction.sender === userAddress ? "Transazione in uscita" : "Transazione in entrata"}>
                    <div className="flex-shrink-0">
                      {getTransactionIcon(transaction)}
                    </div>
                  </Tooltip>
                  <div>
                    <p className="text-body-regular font-medium text-white">
                      {formatTransactionType(transaction.type)}
                    </p>
                    <p className="text-body-secondary text-slate-400">
                      {transaction.timestamp ? 
                        new Date(transaction.timestamp * 1000).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        `Round ${transaction.round}`
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-body-regular font-medium ${
                    transaction.sender === userAddress ? 'text-error-400' : 'text-success-400'
                  }`}>
                    {transaction.sender === userAddress ? '-' : '+'}
                    {walletService.formatAlgo(transaction.amount)} ALGO
                  </p>
                  <Tooltip content="Commissione di rete pagata per la transazione">
                    <p className="text-body-secondary text-slate-400 cursor-help">
                      Fee: {walletService.formatAlgo(transaction.fee)}
                    </p>
                  </Tooltip>
                </div>
              </div>
              {transaction.note && (
                <div className="mt-2 ml-9">
                  <p className="text-body-secondary text-slate-500 bg-slate-800 rounded px-2 py-1">
                    {transaction.note}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const renderAssets = () => {
    if (!state.walletInfo?.assets.length) {
      return (
        <Card variant="default" padding="lg">
          <div className="text-center">
            <Squares2X2Icon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-subsection-title text-white mb-2">Nessuna certificazione</h3>
            <p className="text-body-regular text-slate-400">Le tue certificazioni soulbound appariranno qui quando ne riceverai o creerai.</p>
          </div>
        </Card>
      );
    }

    return (
      <Card 
        variant="default" 
        title="Certificazioni Soulbound"
        icon={<Squares2X2Icon className="h-5 w-5" />}
        actions={
          <Tooltip content="Certificazioni NFT non trasferibili associate al tuo wallet">
            <InformationCircleIcon className="h-4 w-4 text-slate-400 cursor-help" />
          </Tooltip>
        }
      >
        <div className="space-y-3">
          {state.walletInfo.assets.slice(0, 8).map((asset) => (
            <div key={asset.assetId} className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Squares2X2Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <TruncatedText
                      text={asset.name || `Certificazione #${asset.assetId}`}
                      maxWidth="250px"
                      className="text-body-regular font-medium text-white"
                      tooltipClassName="z-50"
                    />
                    <div className="flex items-center gap-2 text-body-secondary text-slate-400">
                      {asset.unitName && (
                        <Tooltip content="Simbolo dell'asset">
                          <span className="cursor-help">Unit: {asset.unitName}</span>
                        </Tooltip>
                      )}
                      {asset.total && (
                        <Tooltip content="Quantità totale emessa">
                          <span className="cursor-help">• Total: {asset.total}</span>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-body-regular font-medium text-white">
                    {asset.amount}
                    {asset.unitName && ` ${asset.unitName}`}
                  </p>
                  <Tooltip content="ID univoco dell'asset sulla blockchain Algorand">
                    <p className="text-body-secondary text-slate-400 cursor-help">
                      ID: {asset.assetId}
                    </p>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  if (state.loading) {
    return (
      <ResponsiveLayout title="Gestione Wallet">
        <div className="space-y-4">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-slate-700 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-slate-700 rounded w-96 animate-pulse"></div>
            </div>
            <div className="w-24 h-8 bg-slate-700 rounded animate-pulse"></div>
          </div>

          {/* Balance Card Skeleton */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="h-6 bg-primary-400/30 rounded w-32 mb-2"></div>
                <div className="h-4 bg-primary-400/30 rounded w-48"></div>
              </div>
              <div className="w-8 h-8 bg-primary-400/30 rounded"></div>
            </div>
            <div className="h-10 bg-primary-400/30 rounded w-40 mb-2"></div>
            <div className="h-5 bg-primary-400/30 rounded w-24"></div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="bg-slate-800 rounded-lg p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-600 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-600 rounded w-20 mb-1"></div>
                    <div className="h-6 bg-slate-600 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs Skeleton */}
          <div className="bg-slate-800 rounded-lg p-4 animate-pulse">
            <div className="flex bg-slate-900 rounded-lg p-1 gap-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex-1 h-12 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-slate-800 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (state.error) {
    return (
      <ResponsiveLayout title="Gestione Wallet">
        <div className="flex items-center justify-center min-h-[400px]">
          <ErrorMessage 
            message={state.error}
            onRetry={() => fetchWalletData()}
          />
        </div>
      </ResponsiveLayout>
    );
  }

  const tabs = [
    {
      id: 'overview',
      label: 'Bilancio',
      content: (
        <div className="space-y-4">
          {state.walletInfo?.assets && state.walletInfo.assets.length > 0 && renderAssets()}
        </div>
      )
    },
    {
      id: 'transactions',
      label: 'Transazioni',
      content: renderTransactions()
    },
    {
      id: 'assets',
      label: 'Certificazioni',
      content: renderAssets()
    }
  ];

  return (
    <ResponsiveLayout title="Gestione Wallet">
      <div className="space-y-4">
        {/* Description and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-slate-400 text-sm">
              Visualizza il saldo, le transazioni e le certificazioni del tuo wallet Algorand
            </p>
          <Tooltip content="Aggiorna i dati del wallet dalla blockchain Algorand">
            <Button
              onClick={() => fetchWalletData(false)}
              loading={state.refreshing}
              size="sm"
              icon={<ArrowPathIcon className="h-4 w-4" />}
              variant="secondary"
            >
              Aggiorna
            </Button>
          </Tooltip>
        </div>

        {/* Balance Card */}
        {renderBalanceCard()}

        {/* Stats */}
        {renderStats()}

        {/* Tabs */}
        <TabsContainer
          tabs={tabs}
          activeTab={state.activeTab}
          onTabChange={(tabId) => setState(prev => ({ ...prev, activeTab: tabId as 'overview' | 'transactions' | 'assets' }))}
          variant="pills"
          responsive={true}
        />
      </div>
    </ResponsiveLayout>
  );
}; 