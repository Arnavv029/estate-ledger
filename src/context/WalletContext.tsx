/**
 * WalletContext.tsx
 * Provides global wallet state management for Web3 connectivity.
 * Handles wallet connection, disconnection, and network switching.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

// Sepolia testnet chain ID
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: string | null;
  isCorrectNetwork: boolean;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToSepolia: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  const isConnected = !!address;
  const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID;

  // Initialize provider and check for existing connection
  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const browserProvider = new BrowserProvider(window.ethereum);
        setProvider(browserProvider);

        // Check if already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          const signerInstance = await browserProvider.getSigner();
          setSigner(signerInstance);
        }

        // Get current chain
        const chain = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(chain);
      }
    };

    init();
  }, []);

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setAddress(null);
          setSigner(null);
        } else {
          setAddress(accounts[0]);
        }
      };

      const handleChainChanged = (chain: string) => {
        setChainId(chain);
        window.location.reload(); // Recommended by MetaMask
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Connect wallet function
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        if (provider) {
          const signerInstance = await provider.getSigner();
          setSigner(signerInstance);
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [provider]);

  // Disconnect wallet function
  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
  }, []);

  // Switch to Sepolia network
  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (error: any) {
      // If Sepolia is not added, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      }
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        chainId,
        isCorrectNetwork,
        provider,
        signer,
        connect,
        disconnect,
        switchToSepolia,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to access wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
