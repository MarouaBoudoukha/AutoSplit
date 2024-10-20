// src/context/GlobalState.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../utils/contractConfig.mjs';

interface GlobalContextProps {
  account: string | null;
  setAccount: React.Dispatch<React.SetStateAction<string | null>>;
  connectWallet: () => void;
  currentUser: string;
  groupId: number | null;
  setGroupId: React.Dispatch<React.SetStateAction<number | null>>;
  contract: ethers.Contract | null;
}

export const GlobalContext = createContext<GlobalContextProps>({
  account: null,
  setAccount: () => {},
  connectWallet: () => {},
  currentUser: 'Alice',
  groupId: null,
  setGroupId: () => {},
  contract: null,
});

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('Alice'); // Mock current user
  const [groupId, setGroupId] = useState<number | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      alert('MetaMask is not installed!');
      return;
    }

    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);

      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();

      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contractInstance);

      // Mock setting current user based on account
      if (accounts[0] === '0xABC123...') setCurrentUser('Alice');
      else if (accounts[0] === '0xDEF456...') setCurrentUser('Bob');
      else setCurrentUser('Charlie');
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
            // Mock setting current user based on account
            if (accounts[0] === '0xABC123...') setCurrentUser('Alice');
            else if (accounts[0] === '0xDEF456...') setCurrentUser('Bob');
            else setCurrentUser('Charlie');
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };
    checkWalletConnected();
  }, []);

  return (
    <GlobalContext.Provider value={{ account, setAccount, connectWallet, currentUser, groupId, setGroupId, contract }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
