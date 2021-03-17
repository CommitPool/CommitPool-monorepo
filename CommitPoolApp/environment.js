import Constants from 'expo-constants';
import daiAbi from './daiAbi.json';
import abi from '../CommitPoolContract/abi/SinglePlayerCommit.json';

const ENV = {
	// MATIC MUMBAI
	// dev: {
	//   commitPoolContractAddress: "0x9CD838ba5ce219d1Eaf58Fa413b9D6e74799A7c8",
	//   daiContractAddress: "0x70d1F773A9f81C852087B77F6Ae6d3032B02D2AB",
	//   linkContractAddress: "0x70d1F773A9f81C852087B77F6Ae6d3032B02D2AB",
	//   rpcUrl:
	//     "https://rpc-mumbai.maticvigil.com/v1/e121feda27b4c1387cd0bf9a441e8727f8e86f56",
	//   abi: abi,
	//   daiAbi: daiAbi,
	//   torusLogging: true,
	// },
	// RINKEBY
	dev: {
		network: 'rinkeby',
		commitPoolContractAddress: '0x24A2D8772521A9fa2f85d7024e020e7821C23c97',
		daiContractAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
		// daiContractAddress: "0xc7ad46e0b8a400bb3c915120d284aafba8fc4735",
		// linkContractAddress: "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",
		// oracleAddress: "0xFe620910d11E613922Bc3891EE25c6e9362Ac5ab",
		jobId: 'de8fc7b07bf54d7c8243b3b4801834c7',
		rpcUrl: 'https://ropsten.infura.io/v3/86deb8025479412bb2ef3dcc87fa90ff',
		abi: abi,
		daiAbi: daiAbi,
		torusLogging: true,
	},
	prod: {
		commitPoolContractAddress: '0xDb28e5521718Cf746a9900DE3Aff12644F699B98',
		daiContractAddress: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
		linkContractAddress: '0xb0897686c545045aFc77CF20eC7A532E3120E0F1',
		rpcUrl:
			'https://rpc-mainnet.maticvigil.com/v1/e121feda27b4c1387cd0bf9a441e8727f8e86f56',
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
	} else if (env === 'prod') {
		return ENV.prod;
	}
};

export default getEnvVars;
