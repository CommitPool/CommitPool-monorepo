import {Biconomy} from "@biconomy/mexa";
import { ethers } from "ethers";

const getProvider = (walletProvider) => {
  let currentProvider = getCurrentProvider();
  if (currentProvider !== "unknown") {
    console.log("Web3 found", window.web3.currentProvider);
  }

  if (currentProvider === "metamask") {
    console.log("Metamask found");
  }
  console.log("Creating provider");
  let biconomy = new Biconomy(new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/fb9dd1f3476f44ad92158c24ba5120c6"),
  {
    walletProvider: walletProvider, 
    apiKey: "tQ8cyyMQH.7136b383-8ad3-470e-9004-930645dcc052", 
    debug: true
  });   

  let networkProvider = new ethers.providers.Web3Provider(biconomy);
  console.log("BICONOMY: ", biconomy);
  console.log("NETWORK PROVIDER: ", networkProvider);

  return [biconomy, networkProvider];
};

const getCurrentProvider = () => {
  if (!window.web3) return "unknown";

  if (window.web3.currentProvider.isMetaMask) return "metamask";

  if (window.web3.currentProvider.isTorus) return "torus";
};

export default getProvider;
