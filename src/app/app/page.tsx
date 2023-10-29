// pages/index.js
'use client'

import { use, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { BrowserProvider } from 'ethers';
import { MetaMaskInpageProvider } from "@metamask/providers";
import certificateAbi from '@/lib/certificateAbi';
import crypto from 'crypto';

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
  const [certificateHash, setCertificateHash] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<string[] | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);


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

  const generateCertificateHash = async (certificate: string) => {
    if (!provider) {
      alert('Please connect to your wallet first.');
      return;
    }
    try {
      const hash = crypto.createHash('sha256').update(certificate).digest('hex');
      setCertificateHash(hash);

    } catch (error) {
      alert('Please add your contract address and ABI.');
      console.error(error);
    }
  }

  const verifyCertificate = async (certificateHash: string) => {
    setVerified(null);
    if (!provider) {
      alert('Please connect to your wallet first.');
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
      const verified = await contract.verifyCertificate(account, certificateHash);
      console.log('Certificate verification result:', verified);
      setVerified(verified);
    } catch (error) {
      console.error(error);
    }
  };

  const addCertificate = async (certificateHash: string) => {
    if (!provider) {
      alert('Please connect to your wallet first.');
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
      const verified = await contract.addCertificate(account, certificateHash);
      console.log('Certificate verification result:', verified);
      await fetchCertificates();
    } catch (error) {
      console.error(error);
    }
  }

  const fetchCertificates = async () => {
    if (!provider) {
      alert('Please connect to your wallet first.');
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
      const certificateHashes = await contract.fetchStudentCertificates(account);
      console.log('Certificate verification result:', certificateHashes);
      setCertificates(certificateHashes);
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
      const account = (await signer).address;
      setAccount(account);
      const balance = await provider.getBalance(account);
      const etherString = ethers.formatEther(balance);
      setBalance(etherString);
      fetchCertificates();
    }

    if (provider) {
      getAccount();
    }
  }, [provider]);

  return (
    <div>
      {
        verified === false && (
          <div className='flex items-center justify-center w-full h-64 p-4 m-4 bg-red-100 rounded-lg dark:bg-red-900'>
            <p className='text-2xl text-red-500'>Certificate is not verified!</p>
          </div>
        )
      }
      {/* green alert if verified is true */}
      {
        verified === true && (
          <div className='flex items-center justify-center w-full h-64 p-4 m-4 bg-green-100 rounded-lg dark:bg-green-900'>
            <p className='text-2xl text-green-500'>Certificate is verified!</p>
          </div>
        )
      }
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
      {
        hasMetamask ? (
          <div>
            <button onClick={async () => await fetchCertificates()}>Fetch Certificates</button>
          </div>
        ) : ""
      }
      {
        hasMetamask ? (
          <div>
            Certificate: <input type="text" className='text-black dark:text-white bg-gray-100 dark:bg-gray-900' onChange={(e) => setCertificate(e.target.value)} />
          </div>
        ) : ""
      }
      {
        hasMetamask && certificate && (
          <div>
            <div>
              Certificate Hash: {certificateHash ? certificateHash : "..."}
            </div>
            <div>
              {
                certificate && (
                  <button onClick={async () => await generateCertificateHash(certificate)}>Generate Certificate Hash</button>
                )
              }
            </div>
          </div>
        )
      }
      {
        hasMetamask && certificateHash && (
          <div>
            <button onClick={async () => await addCertificate(certificateHash)}>Add Certificate</button>
          </div>
        )
      }
      {
        hasMetamask && certificateHash && (
          <div>
            {/* <button onClick={async () => await verifyCertificate("a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3")}>Verify Certificate</button> */}
            <button onClick={async () => await verifyCertificate(certificateHash)}>Verify Certificate</button>
          </div>
        )
      }
      {
        hasMetamask && certificates && (
          <div>
            {
              certificates.map((certificate, index) => (
                <div className='flex flex-col items-center justify-center w-full h-64 p-4 m-4 bg-gray-100 rounded-lg dark:bg-gray-900' key={index}>
                  <p>Certificate: {certificate}</p>
                  <button onClick={async () => await verifyCertificate(certificate)}>Verify Certificate</button>
                </div>
              ))
            }
          </div>
        )
      }
    </div>
  );
};

export default CertificatesPage;
