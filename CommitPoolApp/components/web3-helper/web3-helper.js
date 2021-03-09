import getEnvVars from "../../environment.js";
import getContract from "../contract/contract";
import Torus from "@toruslabs/torus-embed";
import getProvider from "../provider/provider";

const {
  commitPoolContractAddress,
  daiContractAddress,
  abi,
  daiAbi,
  torusLogging,
} = getEnvVars();

const web3Helper = {
  account: undefined,
  biconomy: undefined,
  contracts: {
    commitPool: undefined,
    dai: undefined,
  },
  setContracts: function (provider) {
    web3Helper.contracts.dai = getContract(
      daiContractAddress,
      daiAbi,
      provider.getSignerByAddress(web3Helper.account)
    );
    web3Helper.contracts.commitPool = getContract(
      commitPoolContractAddress,
      abi,
      provider.getSignerByAddress(web3Helper.account)
    );
  },
  logOut: function () {
    web3Helper.torus.cleanUp();
    web3Helper.initialize();
  },
  provider: undefined,
  torus: undefined,
  initialize: async function () {
    const torus = new Torus({
      buttonPosition: "bottom-left",
    });

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

    [web3Helper.account] = await web3Helper.torus.login();
    [web3Helper.biconomy, web3Helper.provider] = getProvider(
      web3Helper.torus.provider
    );

    web3Helper.biconomy
      .onEvent(web3Helper.biconomy.READY, () => {
        console.log("BICONOMY READYY!!!!");
        web3Helper.setContracts(web3Helper.biconomy);
      })
      .onEvent(web3Helper.biconomy.ERROR, (error, message) => {
        console.log("BICONOMY ERROR: ", message);
      });
    return web3Helper;
  },
};

export default web3Helper;
