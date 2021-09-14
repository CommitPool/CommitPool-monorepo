import { ethers } from "ethers";
import getEnvVars from "../../environment.js";
import getContract from "../contract/contract";
import Torus from "@toruslabs/torus-embed";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";

//TODO typing
const {
  commitPoolContractAddress,
  daiContractAddress,
  abi,
  daiAbi,
  torusLogging,
} = getEnvVars();

const providerOptions = {
  torus: {
    package: Torus,
    options: {
      networkParams: {
        host: "https://polygon-mainnet.infura.io/v3/3c072dd341bb4e45858038e146195ae1",
        chainId: 137,
        networkId: 137,
        networkName: "Polygon Main Network",
      },
      config: {
        buildEnv: "production",
        showTorusButton: true,
        enableLogging: torusLogging,
      },
    },
  },
  walletconnect: {
    network: "Polygon Main Network",
    package: WalletConnectProvider,
    options: {
      rpc: {
        137: `https://polygon-mainnet.infura.io/v3/3c072dd341bb4e45858038e146195ae1`,
      },
    },
  },
};

const defaultWeb3Modal = new Web3Modal({
  network: "Polygon Main Network",
  cacheProvider: true, // optional
  providerOptions, // required
});

const web3Helper = {
  account: undefined,
  contracts: undefined,
  isLoggedIn: false,
  logOut: async function () {
    console.log("Web3Helper before closing: ", web3Helper);
    if (web3Helper.provider && web3Helper.provider.close) {
      await web3Helper.provider.close();
    }
    web3Helper.web3Modal.clearCachedProvider();
    web3Helper.web3Modal = defaultWeb3Modal;
    web3Helper.account = undefined;
    web3Helper.provider = undefined;
    web3Helper.contracts = undefined;
    web3Helper.isLoggedIn = false;
    window.localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
  },
  provider: undefined,
  web3Modal: defaultWeb3Modal,
  connectProvider: async () => {
    return await defaultWeb3Modal.connect();
  },

  initialize: async () => {
    return await setWeb3Modal(web3Helper)
      .then(setWeb3Provider)
      .then(setAccount)
      .then(setContracts)
      .then(setLoggedIn);
  },
};

const setAccount = (web3Helper) => {
  if (web3Helper.provider) {
    const account = deriveSelectedAddress(web3Helper.provider.provider);
    web3Helper.account = account;
  }
  return web3Helper;
};

const setContracts = (web3Helper) => {
  if (web3Helper.provider) {
    const contracts = getContractsWithProvider(web3Helper.provider);
    web3Helper.contracts = contracts;
  }
  return web3Helper;
};

const setLoggedIn = (web3Helper) => {
  if (web3Helper.provider && web3Helper.account && web3Helper.contracts) {
    web3Helper.isLoggedIn = true;
  } else {
    web3Helper.isLoggedIn = false;
  }

  return web3Helper;
};

const setWeb3Modal = async (web3Helper) => {
  const localProvider = await web3Helper.connectProvider();
  web3Helper.web3Modal = localProvider;
  return web3Helper;
};

const setWeb3Provider = (web3Helper) => {
  const localProvider = subscribeToEvents(web3Helper.web3Modal);
  web3Helper.provider = new ethers.providers.Web3Provider(localProvider);
  return web3Helper;
};

const deriveSelectedAddress = (provider: any) => {
  console.log(provider);
  if (provider.isMetaMask || provider.isTorus) {
    return provider.selectedAddress;
  }

  if (provider.wc) {
    return provider.accounts[0];
  }

  return null;
};

const getContractsWithProvider = (provider) => {
  const dai = getContract(daiContractAddress, daiAbi, provider);
  const commitPool = getContract(commitPoolContractAddress, abi, provider);

  return { dai, commitPool };
};

const subscribeToEvents = (provider) => {
  const localProvider = provider;

  // Subscribe to accounts change
  localProvider.on("accountsChanged", (accounts: string[]) => {
    console.log(accounts);
  });

  // Subscribe to chainId change
  localProvider.on("chainChanged", (chainId: number) => {
    console.log(chainId);
  });

  // Subscribe to provider connection
  localProvider.on("connect", (info: { chainId: number }) => {
    console.log(info);
  });

  // Subscribe to provider disconnection
  localProvider.on("disconnect", (error: { code: number; message: string }) => {
    console.log(error);
  });

  return localProvider;
};

export default web3Helper;
