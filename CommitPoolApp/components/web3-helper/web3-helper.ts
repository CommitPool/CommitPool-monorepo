import { ethers } from "ethers";
import getEnvVars from "../../environment.js";
import getContract from "../contract/contract";
import Torus from "@toruslabs/torus-embed";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import { Web3Provider } from "@ethersproject/providers";

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
      137: `https://polygon-mainnet.infura.io/v3/3c072dd341bb4e45858038e146195ae1`,
    },
  },
};

const connectProvider = async () => {
  return await web3Modal.connect();
};

const web3Modal = new Web3Modal({
  network: "Polygon Main Network",
  cacheProvider: true, // optional
  providerOptions, // required
});

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

const web3Helper = {
  account: undefined,
  setAccount: function (localProvider) {
    web3Helper.account = deriveSelectedAddress(localProvider.provider);
  },
  contracts: {
    commitPool: {},
    dai: {},
  },
  isLoggedIn: false,
  logOut: function () {
    web3Modal.clearCachedProvider();
    web3Helper.initialize();
  },
  provider: undefined,
  setWeb3Provider: function (localProvider) {
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
    localProvider.on(
      "disconnect",
      (error: { code: number; message: string }) => {
        console.log(error);
      }
    );

    web3Helper.provider = new ethers.providers.Web3Provider(localProvider);
    web3Helper.contracts.dai = getContract(
      daiContractAddress,
      daiAbi,
      web3Helper.provider
    );

    web3Helper.contracts.commitPool = getContract(
      commitPoolContractAddress,
      abi,
      web3Helper.provider
    );

    web3Helper.isLoggedIn = true;
    return web3Helper.provider;
  },
  wallet: {},
  initialize: async function () {
    await connectProvider().then(localProvider => web3Helper.setWeb3Provider(localProvider)).then(web3Provider => this.setAccount(web3Provider));
    return web3Helper;
  },
};

export default web3Helper;
