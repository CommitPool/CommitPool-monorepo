import Constants from "expo-constants";
import daiAbi from "./daiAbi.json";
import abi from "../CommitPoolContract/out/abi/contracts/SinglePlayerCommit.sol/SinglePlayerCommit.json";

const ENV = {
  dev: {
    commitPoolContractAddress: "0x286Bcf38B881743401773a3206B907901b47359E",
    daiContractAddress: "0x70d1F773A9f81C852087B77F6Ae6d3032B02D2AB",
    linkContractAddress: "0x70d1F773A9f81C852087B77F6Ae6d3032B02D2AB",
    rpcUrl:
      "https://rpc-mumbai.maticvigil.com/v1/e121feda27b4c1387cd0bf9a441e8727f8e86f56",
    abi: abi,
    daiAbi: daiAbi,
    torusLogging: true,
  },
  prod: {
    commitPoolContractAddress: "0xDb28e5521718Cf746a9900DE3Aff12644F699B98",
    daiContractAddress: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    linkContractAddress: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
    rpcUrl:
      "https://rpc-mainnet.maticvigil.com/v1/e121feda27b4c1387cd0bf9a441e8727f8e86f56",
    abi: abi,
    daiAbi: daiAbi,
    torusLogging: false,
  },
};
const getEnvVars = (env = Constants.manifest.releaseChannel) => {
  // What is __DEV__ ?
  // This variable is set to true when react-native is running in Dev mode.
  // __DEV__ is true when run locally, but false when published.
  if (__DEV__) {
    return ENV.dev;
  } else if (env === "prod") {
    return ENV.prod;
  }
};

export default getEnvVars;
