import { Network } from "../types";

interface SupportedChains {
  [chainId: string]: Network;
}

export const supportedChains: SupportedChains = {
  "0x89": {
    name: "Polygon",
    short_name: "matic",
    chain: "MATIC",
    network: "matic",
    network_id: 137,
    chain_id: "0x89",
    providers: ["walletconnect", "torus"],
    rpc_url:
      "https://polygon-mainnet.infura.io/v3/3c072dd341bb4e45858038e146195ae1",
    block_explorer: "https://polygonscan.com",
    spcAddress: "0x91E17f2A995f7EB830057a2F83ADa3A50a37F20d",
    daiAddress: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    linkAddress: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1"
  },
  "0x13881": {
    name: "Matic Mumbai",
    short_name: "mum",
    chain: "MATIC",
    network: "mumbai",
    network_id: 80001,
    chain_id: "0x13881",
    providers: ["walletconnect", "torus"],
    rpc_url:
      "https://polygon-mumbai.infura.io/v3/3c072dd341bb4e45858038e146195ae1",
    block_explorer: "https://mumbai.polygonscan.com",
    spcAddress: "0x6B6FD55b224b25B2F56A10Ce670B097e66Fca136",
    daiAddress: "0x70d1F773A9f81C852087B77F6Ae6d3032B02D2AB",
    linkAddress: "0x70d1F773A9f81C852087B77F6Ae6d3032B02D2AB",
  },
};

export const chainByID = (chainId: string): Network => supportedChains[chainId];
export const chainByNetworkId = (networkId: string): Network => {
  const idMapping: any = {
    137: supportedChains["0x89"],
    80001: supportedChains["0x13881"],
  };

  return idMapping[networkId];
};
