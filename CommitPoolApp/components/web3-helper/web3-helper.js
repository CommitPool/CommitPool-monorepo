import { ethers } from "ethers";
import getEnvVars from "../../environment.js";
import getContract from "../contract/contract";
import Torus from "@toruslabs/torus-embed";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";

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
        host: "https://polygon-mainnet.infura.io/v3/3c072dd341bb4e45858038e146195ae1", // optional
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
    package: WalletConnectProvider,
    options: {
      137: `https://polygon-mainnet.infura.io/v3/3c072dd341bb4e45858038e146195ae1`, // required
    },
  },
};

const connectProvider = async () => {
  return await web3Modal.connect();
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions, // required
});

const web3Helper = {
  // account: undefined,
  // setAccount: function(provider) {
  //   web3Helper.account = provider.selectedAddress;
  //   console.log("WEB3HELPER account", web3Helper.account)
  // },
  contracts: {
    commitPool: {},
    dai: {},
  },
  logOut: function () {
    web3Helper.torus.cleanUp();
    web3Helper.initialize();
  },
  provider: undefined,
  setWeb3Provider: function (provider) {
    web3Helper.provider = new ethers.providers.Web3Provider(
      provider
    );
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
  torus: {},
  wallet: {},
  initialize: async function () {
    await connectProvider().then(this.setWeb3Provider);
    return web3Helper;
  },
};

export default web3Helper;
