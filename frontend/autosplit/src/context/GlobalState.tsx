// src/context/GlobalState.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';

interface GlobalContextProps {
  account: string | null;
  setAccount: React.Dispatch<React.SetStateAction<string | null>>;
  connectWallet: () => void;
}

export const GlobalContext = createContext<GlobalContextProps>({
  account: null,
  setAccount: () => {},
  connectWallet: () => {},
});

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      alert('MetaMask is not installed!');
      return;
    }

    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      // Future: Send the account to backend if needed
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  useEffect(() => {
    const checkWalletConnected = async () => {
      if ((window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            // Future: Send the account to backend if needed
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };
    checkWalletConnected();
  }, []);

  return (
    <GlobalContext.Provider value={{ account, setAccount, connectWallet }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
