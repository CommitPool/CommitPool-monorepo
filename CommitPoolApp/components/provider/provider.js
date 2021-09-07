import { ethers } from "ethers";

const provider = (provider) => {
  let currentProvider = getCurrentProvider();
  if (currentProvider !== 'unknown') {
    console.log("Web3 found", window.web3.currentProvider);
  }
  
  if (currentProvider === 'metamask') {
      console.log("Metamask found")
  }
  console.log("Creating provider");

  return new ethers.providers.Web3Provider(provider);
};

const getCurrentProvider = () => {
  if (!window.web3) return 'unknown';

  if (window.web3.currentProvider.isMetaMask)
      return 'metamask';
}

export default provider;
