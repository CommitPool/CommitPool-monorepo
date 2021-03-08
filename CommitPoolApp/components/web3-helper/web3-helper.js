import { ethers } from "ethers";
import getEnvVars from "../../environment.js";
import getContract from "../contract/contract";
import Torus from "@toruslabs/torus-embed";
import getProvider from "../provider/provider";

const {
  commitPoolContractAddress,
  daiContractAddress,
  abi,
  daiAbi,
  torusLogging
} = getEnvVars();

const web3Helper = {
  account: undefined,
  setAccount: function(walletProvider) {
    web3Helper.account = walletProvider.selectedAddress;
    console.log("WEB3HELPER account", web3Helper.account)
  },
  contracts: {
    commitPool: {},
    dai: {},
  },
  logOut: function(){
    web3Helper.torus.cleanUp();
    web3Helper.initialize();
  },
  provider: undefined,
  setWeb3Provider: function (walletProvider) {
    web3Helper.provider = getProvider(walletProvider);
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
      buttonPosition: "bottom-left",
    })
    web3Helper.torus = torus;
    await web3Helper.torus.init({
      buildEnv: "production", 
      enableLogging: torusLogging, 
      network: {
        host: "rinkeby", 
        // chainId: 80001, 
        // networkName: "Mumbai Test Network", 
      },
      showTorusButton: true,
    });

    await web3Helper.torus.login(); 
    web3Helper.setAccount(torus.provider);
    web3Helper.setWeb3Provider(torus.provider);
    return web3Helper;
  },
};

export default web3Helper;
