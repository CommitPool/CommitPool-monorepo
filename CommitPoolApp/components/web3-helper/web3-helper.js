import { ethers } from "ethers";
import getEnvVars from "../../environment.js";
import getContract from "../contract/contract";
import getWallet from '../wallet/wallet';
import Torus from "@toruslabs/torus-embed";

const {
  commitPoolContractAddress,
  daiContractAddress,
  abi,
  daiAbi,
} = getEnvVars();

const web3Helper = {
  contracts: {
    dai: {},
    spc: {},
  },
  web3Provider: {},
  setWeb3Provider: function (provider) {
    const _web3Provider = new ethers.providers.Web3Provider(provider);
    web3Helper.web3Provider = _web3Provider;
    web3Helper.contracts.dai = getContract(
      daiContractAddress,
      daiAbi,
      _web3Provider
    );
    web3Helper.contracts.spc = getContract(
      commitPoolContractAddress,
      abi,
      _web3Provider
    );
  },
  torus: {},
  wallet: {},
  initialize: async function () {
    const torus = new Torus();
    await torus.init({
      buildEnv: "production", // default: production
      enableLogging: true, // default: false
      network: {
        host: "mumbai", // default: mainnet
        chainId: 80001, // default: 1
        networkName: "Mumbai Test Network", // default: Main Ethereum Network
      },
      showTorusButton: true, // default: true
    });
    await torus.login(); // await torus.ethereum.enable()
    web3Helper.setWeb3Provider(torus.provider);
    web3Helper.torus = torus;
    console.log("TORUS INIT SUCCESS");
  },
};

export default web3Helper;
