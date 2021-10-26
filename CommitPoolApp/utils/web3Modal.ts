import Torus from "@toruslabs/torus-embed";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Network } from "../types";
import { chainByID, chainByNetworkId } from "./chain";

//TODO Detect connected network and notify user to change to Polygon
// Not it does not present the modal when on mainnet
// Let app always connect provider to e.g. Polygon mainnet
// If selected web3modal provider is MetaMask, but MM is on unsupported network, display network with error(box/modal/toast) to tell user to switch to supported network (Polygon Mainnet) and implement this flow using the MM RPC API to add/switch network: https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods

const isInjected = () => {
  const id = window.ethereum?.chainId;
  console.log("chain ID: ", id);
  return id;
};

export const attemptInjectedChainData = (): Network =>
  isInjected() ? chainByID(window.ethereum.chainId) : chainByID("137");

const addNetworkProviders = (chainData: Network) => {
  const allProviders: any = {};
  if (!chainData) {
    // this will fire if window.ethereum exists, but the user is on the wrong chain
    return false;
  }
  const providersToAdd = chainData.providers;
  if (providersToAdd.includes("walletconnect")) {
    allProviders.walletconnect = {
      network: chainData.network,
      package: WalletConnectProvider,
      options: {
        rpc: {
          137: "https://polygon-mainnet.infura.io/v3/3c072dd341bb4e45858038e146195ae1",
          80001:
            "https://polygon-mumbai.infura.io/v3/3c072dd341bb4e45858038e146195ae1",
        },
      },
    };
  }

  if (providersToAdd.includes("torus")) {
    allProviders.torus = {
      package: Torus,
      options: {
        networkParams: {
          host: chainData.rpc_url,
          chainId: chainData.chain_id,
          networkId: chainData.network_id,
        },
        config: {
          buildEnv: "production",
          showTorusButton: true,
        },
      },
    };
  }

  return allProviders;
};

export const getProviderOptions = () =>
  addNetworkProviders(attemptInjectedChainData());

export const deriveChainId = (provider: any) => {
  console.log("Deriving chain ID from: ", provider);
  if (provider.isMetaMask || provider.isTorus) {
    return provider.chainId;
  }
  if (provider.wc) {
    return chainByNetworkId(provider.chainId).chain_id;
  }
};

export const deriveSelectedAddress = (provider: any): string | undefined => {
  if (provider.isMetaMask || provider.isTorus) {
    return provider.selectedAddress;
  }

  if (provider.wc) {
    return provider.accounts[0];
  }
  return undefined;
};
