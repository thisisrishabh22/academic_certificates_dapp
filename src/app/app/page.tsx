// pages/index.js
'use client'

import { use, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { BrowserProvider } from 'ethers';
import { MetaMaskInpageProvider } from "@metamask/providers";
import certificateAbi from '@/lib/certificateAbi';

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider
  }
}

const CertificatesPage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [hasMetamask, setHasMetamask] = useState(false);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);


  useEffect(() => {
    connectToWallet();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      setHasMetamask(true);
    }
  }, [window]);

  const connectToWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        setIsConnected(true);
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        if (!ethProvider) {
          alert('Please install MetaMask or use a Web3-enabled browser.');
          return;
        }
        setProvider(ethProvider);
      } else {
        setIsConnected(false);
        alert('Please install MetaMask or use a Web3-enabled browser.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const verifyCertificate = async (certificateHash: string) => {
    if (!provider) {
      alert('Please connect to your wallet first.');
      return;
    }
    try {
      const signer = await provider.getSigner();
      const contractAddress = process.env.NEXT_PUBLIC_CERTIFICATE_CONTRACT_ADDRESS; // Replace with your deployed contract address
      const contractAbi = certificateAbi; // Replace with your contract ABI

      console.log(contractAddress);
      if (!contractAddress || !contractAbi) {
        alert('Please add your contract address and ABI.');
        return;
      }

      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      const verified = await contract.verifyCertificate(account, certificateHash);
      console.log('Certificate verification result:', verified);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {

    const getAccount = async () => {
      if (!provider) {
        return;
      }
      const signer = provider.getSigner();
      const account = (await signer).address;
      setAccount(account);
      const balance = await provider.getBalance(account);
      const etherString = ethers.formatEther(balance);
      setBalance(etherString);
    }

    if (provider) {
      getAccount();
    }
  }, [provider]);

  return (
    <div>
      {/* <h1>Academic Certificate Verification</h1>
      <button onClick={connectToWallet}>Connect Wallet</button>
      <button onClick={() => verifyCertificate('CERTIFICATE_HASH')}>
        Verify Certificate
      </button> */}
      <div>
        {hasMetamask ? (
          isConnected ? (
            "Connected! "
          ) : (
            <button onClick={connectToWallet}>Connect</button>
          )
        ) : (
          "Please install metamask"
        )}

        {isConnected ? <button onClick={() => verifyCertificate('CERTIFICATE_HASH')}>Execute</button> : ""}
      </div>
      {
        hasMetamask ? (
          <div>
            {/* Account Information */}
            <div>
              Account: {account ? account : ""}
            </div>
            {/* Balance */}
            <div>
              Balance: {balance ? balance : ""}
            </div>
          </div>
        ) : ""
      }
    </div>
  );
};

export default CertificatesPage;
