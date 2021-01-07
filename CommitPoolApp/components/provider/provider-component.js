import Web3Modal from "web3modal";
import { ethers } from 'ethers';

export default async () => {
    const providerOptions = {
        /* See Provider Options Section */
      };
      
    const web3Modal = new Web3Modal({
    // network: "mainnet", // optional
    cacheProvider: true, // optional
    providerOptions // required
    });
    
    const provider = await web3Modal.connect();
    return new ethers.providers.Web3Provider(provider);
}
