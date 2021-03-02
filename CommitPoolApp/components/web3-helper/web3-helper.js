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
  // account: undefined,
  // setAccount: function(provider) {
  //   web3Helper.account = provider.selectedAddress;
  //   console.log("WEB3HELPER account", web3Helper.account)
  // },
  contracts: {
    commitPool: {},
    dai: {},
  },
  logOut: function(){
    web3Helper.torus.cleanUp();
    web3Helper.initialize();
  },
  provider: undefined,
  setWeb3Provider: function () {
    web3Helper.provider = new ethers.providers.Web3Provider(web3Helper.torus.provider);
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
    web3Helper.setWeb3Provider();
    return web3Helper;
  },
};

export default web3Helper;
