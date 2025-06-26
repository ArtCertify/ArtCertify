import React from 'react';
import { BanknotesIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import Alert from './Alert';
import Button from './Button';
import { useWalletValidation } from '../../hooks/useWalletValidation';
import { config } from '../../config/environment';

interface WalletFundsAlertProps {
  requiredBalance?: number;
  showActions?: boolean;
  onFundsAdded?: () => void;
}

export const WalletFundsAlert: React.FC<WalletFundsAlertProps> = ({
  requiredBalance = 0.1,
  showActions = true,
  onFundsAdded
}) => {
  const { 
    canPerformCertification, 
    isEmptyAccount, 
    hasMinimumFunds, 
    balance, 
    isLoading,
    refetch 
  } = useWalletValidation(requiredBalance);

  // Non mostrare nulla se il wallet è valido
  if (canPerformCertification || isLoading) {
    return null;
  }

  const getAlertContent = () => {
    if (isEmptyAccount) {
      return {
        title: 'Account Nuovo Rilevato',
        description: `Questo wallet non ha ancora interagito con la blockchain Algorand${config.network.isMainnet ? ' MainNet' : ' TestNet'}. Per creare certificazioni è necessario avere almeno ${requiredBalance} ALGO per le commissioni di transazione.`,
        variant: 'warning' as const
      };
    }

    if (!hasMinimumFunds) {
      return {
        title: 'Fondi Insufficienti',
        description: `Il saldo attuale (${balance.toFixed(3)} ALGO) è insufficiente. Sono richiesti almeno ${requiredBalance} ALGO per le commissioni di transazione.`,
        variant: 'warning' as const
      };
    }

    return null;
  };

  const alertContent = getAlertContent();
  if (!alertContent) return null;

  const handleRefresh = async () => {
    await refetch();
    onFundsAdded?.();
  };

  return (
    <Alert
      variant={alertContent.variant}
      title={alertContent.title}
    >
      <div>
        <p className="mb-4">{alertContent.description}</p>
        
        {showActions && (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 text-amber-600 mb-2 sm:mb-0">
              <BanknotesIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                Richiesto: {requiredBalance} ALGO
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {config.network.isTestnet && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open('https://dispenser.testnet.aws.algodev.network/', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlusCircleIcon className="w-4 h-4 mr-1" />
                  Ottieni ALGO Testnet
                </Button>
              )}
              
              {config.network.isMainnet && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open('https://www.moonpay.com/buy/algo', '_blank')}
                >
                  <BanknotesIcon className="w-4 h-4 mr-1" />
                  Acquista ALGO
                </Button>
              )}
              
              <Button
                size="sm"
                variant="tertiary"
                onClick={handleRefresh}
              >
                Verifica Fondi
              </Button>
            </div>
          </div>
        )}
      </div>
    </Alert>
  );
}; 