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
  const [images, setImages] = useState([]);
  console.log("images", images)

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
    if (!provider || !file || !certificateHash || !file?.name) {
      alert('Please connect to your wallet, upload a file, and generate a certificate hash with a valid file name.');
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
      await contract.addCertificate(account, certificateHash, cid, file.name);
      alert('Certificate added successfully!');
      await fetchStudentImages();

    } catch (error) {
      console.error(error);
    }
  }

  const fetchStudentImages = async () => {
    if (!provider) {
      alert('Please connect to your wallet.');
      return;
    }
    const contractAddress = process.env.NEXT_PUBLIC_CERTIFICATE_CONTRACT_ADDRESS;
    if (!contractAddress) {
      alert('Please add your contract address.');
      return;
    }
    try {
      const signer = await provider.getSigner();
      const contractAbi = certificateAbi;
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      const images = await contract.fetchStudentCertificates(account);
      const imagesArray = images.map((image: {
        0: string;
        1: string;
      }) => {
        return {
          imageCID: image[0],
          fileName: image[1]
        }
      });
      setImages(imagesArray);
    } catch (error) {
      console.error(error);
      alert('Error fetching student images.');
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

  useEffect(() => {
    if (!account) return
    fetchStudentImages();
  }, [account]);


  // verify certificate by hashing the file from URL and comparing it with the hash stored on the blockchain

  return (
    <div
      className='bg-gray-900 text-white p-4 min-h-screen'
    >
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
            {/* Hr line */}
            <hr
              className='my-4 bg-slate-500 text-slate-500 border-0 h-px opacity-25'
            />
            <h5 className='text-2xl font-bold'>My Certificates: </h5>
            <div
              className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'
            >
              {
                images && images.map((image: {
                  imageCID: string;
                  fileName: string;
                }) => {
                  return (
                    <div
                      className='
                      flex
                      overflow-hidden
                      flex-col w-full justify-between items-center bg-gray-800 m-3 py-6 px-4 rounded-md'
                      key={image.imageCID}>
                      <img
                        className='w-full h-40 object-contain'
                        src={`https://ipfs.io/ipfs/${image.imageCID}/${image.fileName}`} alt={image.fileName} />
                      <div
                        className='flex justify-between w-full over-flow-hidden mt-6'
                      >
                        <p
                          className='text-lg text-ellipsis w-[40%] truncate'
                          aria-label={image.fileName}
                          onMouseEnter={(e) => {
                            e.currentTarget.title = image.fileName;
                          }}
                        >
                          {image.fileName}
                        </p>
                        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
                          Verify
                        </button>
                      </div>
                    </div>
                  )
                })
              }
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
