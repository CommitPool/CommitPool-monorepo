import Constants from "expo-constants";
import daiAbi from "./daiAbi.json";
import abi from "../CommitPoolContract/out/abi/contracts/SinglePlayerCommit.sol/SinglePlayerCommit.json";

const ENV = {
  // MATIC MUMBAI
  dev: {
    commitPoolContractAddress: "0xf2FB28799B15c9BfC3B2Fd020Aad0D2C4b261C61",
    daiContractAddress: "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
    linkContractAddress: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    oracleAddress: "0x1af43B0C2DdC416b375ab97CeF10c73DfF5D27d8",
    jobId: "6a7b108a1cf54ffb96bbdeec92d48568",
    rpcUrl:
      "https://rpc-mumbai.maticvigil.com/v1/e121feda27b4c1387cd0bf9a441e8727f8e86f56",
    abi: abi,
    daiAbi: daiAbi,
    torusLogging: true,
  },
  // RINKEBY
  // dev: {
  //   commitPoolContractAddress: "0x0e92528803F04A82e96Af5d43D5b9faEaF8F28D8",
  //   daiContractAddress: "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",
  //   linkContractAddress: "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",
  //   oracleAddress: "0xFe620910d11E613922Bc3891EE25c6e9362Ac5ab",
  //   jobId: "de8fc7b07bf54d7c8243b3b4801834c7",
  //   commitPoolContractAddress: "0xf2FB28799B15c9BfC3B2Fd020Aad0D2C4b261C61",
  //   daiContractAddress: "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
  //   linkContractAddress: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
  //   oracleAddress: "0x1af43B0C2DdC416b375ab97CeF10c73DfF5D27d8",
  //   jobId: "6a7b108a1cf54ffb96bbdeec92d48568",
  //   rpcUrl: "https://ropsten.infura.io/v3/86deb8025479412bb2ef3dcc87fa90ff",
  //   abi: abi,
  //   daiAbi: daiAbi,
  //   torusLogging: true,
  // },
  prod: {
    commitPoolContractAddress: "0x5f30Ffa902BCceC3Ae5CD827ADA05086E2382D3C",
    daiContractAddress: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    linkContractAddress: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
    oracleAddress: "0x1aB906229213D8d75da7c44077ac95fD3adE3816",
    jobId: "2fdfac54c3574e8e861d4f8c334a4121",
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
  } else {
    return ENV.prod;
  }
};

export default getEnvVars;
