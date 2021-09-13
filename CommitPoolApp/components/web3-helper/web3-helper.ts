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
  connectProvider: async function () {
    return await defaultWeb3Modal.connect();
  },
  setAccount: function (localProvider) {
    web3Helper.account = deriveSelectedAddress(localProvider.provider);
  },
  contracts: {
    commitPool: {},
    dai: {},
  },
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
    web3Helper.contracts = {
      commitPool: {},
      dai: {},
    };
    web3Helper.isLoggedIn = false;
    window.localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
  },
  provider: undefined,
  web3Modal: defaultWeb3Modal,
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

    web3Helper.isLoggedIn = true;
    return web3Helper.provider;
  },
  setContracts: function () {
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
  },
  initialize: async function () {
    await web3Helper
      .connectProvider()
      .then((localProvider) => web3Helper.setWeb3Provider(localProvider))
      .then((web3Provider) => web3Helper.setAccount(web3Provider))
      .then(() => web3Helper.setContracts());
    return web3Helper;
  },
};

export default web3Helper;
