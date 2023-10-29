import { Web3Storage } from 'web3.storage';

const storageClient = (token: string) => {
  return new Web3Storage({ token: token })
};

export default storageClient;
