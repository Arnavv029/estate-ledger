/**
 * WalletConnect.tsx
 * Component for connecting MetaMask wallet with network detection.
 * Shows connection status and allows network switching to Sepolia.
 */

import React from 'react';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/button';
import { Wallet, ChevronDown, AlertTriangle, Check, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WalletConnectProps {
  variant?: 'default' | 'hero';
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ variant = 'default' }) => {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    isCorrectNetwork,
    connect, 
    disconnect,
    switchToSepolia 
  } = useWallet();

  // Format wallet address for display (0x1234...5678)
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Not connected state
  if (!isConnected) {
    return (
      <Button
        onClick={connect}
        disabled={isConnecting}
        className={
          variant === 'hero'
            ? 'btn-gradient px-8 py-6 text-lg font-semibold rounded-xl'
            : ''
        }
      >
        <Wallet className="mr-2 h-5 w-5" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  // Wrong network warning
  if (!isCorrectNetwork) {
    return (
      <Button
        onClick={switchToSepolia}
        variant="destructive"
        className="gap-2"
      >
        <AlertTriangle className="h-4 w-4" />
        Switch to Sepolia
      </Button>
    );
  }

  // Connected state with dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 border-border/50 bg-secondary/50">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono">{formatAddress(address!)}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">Connected to</p>
          <p className="text-sm font-mono truncate">{address}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <Check className="h-4 w-4 text-accent" />
          Sepolia Testnet
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="gap-2 text-destructive">
          <LogOut className="h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
