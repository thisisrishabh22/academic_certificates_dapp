'use client'

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { MetaMaskInpageProvider } from "@metamask/providers";
import certificateAbi from '@/lib/certificateAbi';
import crypto from 'crypto';
import { BrowserProvider } from 'ethers';
import storageClient from '@/lib/storageClient';

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
  const [file, setFile] = useState<File | null>(null);
  const [certificateHash, setCertificateHash] = useState<string | null>(null);

  useEffect(() => {
    connectToWallet();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      setHasMetamask(true);
    }
  }, [this]);

  const connectToWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        if (!ethProvider) {
          alert('Please install MetaMask or use a Web3-enabled browser.');
          return;
        }
        setIsConnected(true);
        setProvider(ethProvider);
      } else {
        setIsConnected(false);
        alert('Please install MetaMask or use a Web3-enabled browser.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = (event: any) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
  }

  useEffect(() => {
    const generateCertificateHash = async () => {
      if (file) {
        try {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            const content = event.target.result;
            const hash = crypto.createHash('sha256').update(content).digest('hex');
            setCertificateHash(hash);
          }
          reader.readAsDataURL(file);
        } catch (error) {
          console.error(error);
        }
      }
    }

    generateCertificateHash();
  }, [file]);

  const storeFile = async () => {
    if (!process.env.NEXT_PUBLIC_WEB_STORAGE_TOKEN) {
      alert('Please add your web storage token.');
      return;
    }
    const client = storageClient(process.env.NEXT_PUBLIC_WEB_STORAGE_TOKEN);
    const fileInput = document.querySelector('input[type="file"]');
    if (!fileInput) return;
    const files = fileInput.files;
    if (!files) {
      alert('Please upload a file.');
      return;
    }
    console.log(files);
    const cid = await client.put(files);
    console.log("cid:", cid);
    return cid;
  }

  const addCertificate = async () => {
    if (!provider || !file || !certificateHash) {
      alert('Please connect to your wallet, upload a file, and generate a certificate hash.');
      return;
    }
    try {
      const signer = await provider.getSigner();
      const contractAddress = process.env.NEXT_PUBLIC_CERTIFICATE_CONTRACT_ADDRESS;
      const contractAbi = certificateAbi;

      if (!contractAddress || !contractAbi) {
        alert('Please add your contract address and ABI.');
        return;
      }

      const contract = new ethers.Contract(contractAddress, contractAbi, signer);

      const cid = await storeFile();
      console.log("CID: ", cid);
      await contract.addCertificate(account, certificateHash, cid);
      alert('Certificate added successfully!');

      // Convert the file to base64
      // const reader = new FileReader();
      // console.log(reader);
      // reader.onload = async (event: any) => {
      //   const content = event.target.result;
      //   const cid = await storeFile();
      //   console.log("CID: ", cid);
      //   await contract.addCertificate(account, certificateHash, cid);
      //   alert('Certificate added successfully!');
      // }
      // reader.readAsDataURL(file);

    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const getAccount = async () => {
      if (!provider) {
        return;
      }
      const signer = provider.getSigner();
      const account = (await signer).address.toLowerCase();
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
      {hasMetamask ? (
        isConnected ? (
          <div>
            <div>
              Account: {account ? account : ""}
            </div>
            <div>
              Balance: {balance ? balance : ""}
            </div>
            <div>
              <input type="file" accept="image/*" onChange={handleFileUpload} />
            </div>
            <div>
              Certificate Hash: {certificateHash ? certificateHash : ""}
            </div>
            <div>
              <button onClick={addCertificate}>Add Certificate</button>
            </div>
          </div>
        ) : (
          <button onClick={connectToWallet}>Connect</button>
        )
      ) : (
        "Please install MetaMask"
      )}
    </div>
  );
};

export default CertificatesPage;
