import { ethers } from "ethers";
import getEnvVars from "../../environment.js";
import getContract from "../contract/contract";
import Torus from "@toruslabs/torus-embed";

const {
  commitPoolContractAddress,
  daiContractAddress,
  abi,
  daiAbi,
  torusLogging
} = getEnvVars();

const web3Helper = {
  account: undefined,
  contracts: {
    commitPool: {},
    dai: {},
  },
  provider: {},
  setWeb3Provider: function (provider) {
    web3Helper.provider = new ethers.providers.Web3Provider(provider);
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
    const torus = new Torus({
      buttonPosition: "bottom-left"
    });

    await torus.init({
      buildEnv: "production", 
      enableLogging: torusLogging, 
      network: {
        host: "mumbai", 
        chainId: 80001, 
        networkName: "Mumbai Test Network", 
      },
      showTorusButton: true,
    });

    await torus.login(); 
    web3Helper.account = torus.provider.selectedAddress;
    web3Helper.setWeb3Provider(torus.provider);
    web3Helper.torus = torus;
    return web3Helper;
  },
};

export default web3Helper;
