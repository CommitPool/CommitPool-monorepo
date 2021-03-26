import { Biconomy } from "@biconomy/mexa";
import { ethers } from "ethers";
import getEnvVars from "../../environment.js";

const { rpcUrl, biconomyApiKey } = getEnvVars();

const getProvider = (walletProvider) => {
  let currentProvider = getCurrentProvider();
  if (currentProvider !== "unknown") {
    console.log("Web3 found", window.web3.currentProvider);
  }

  if (currentProvider === "metamask") {
    console.log("Metamask found");
  }
  console.log("Creating provider");
  let biconomy = new Biconomy(
    new ethers.providers.JsonRpcProvider(rpcUrl),

    {
      // walletProvider: walletProvider,
      apiKey: biconomyApiKey,
      debug: true,
    }
  );

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
