import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useRef,
} from "react";
import { Network } from "../types";
import Web3Modal from "web3modal";
import { useToast } from "@chakra-ui/react";

import { chainByNetworkId, supportedChains } from "../utils/chain";
import {
  deriveChainId,
  deriveSelectedAddress,
  getProviderOptions,
} from "../utils/web3Modal";
import { ethers} from "ethers";

//TODO refactor to Ethers
const defaultModal = new Web3Modal({
  providerOptions: getProviderOptions(),
  cacheProvider: true,
  theme: "dark",
});

export const InjectedProviderContext = createContext<{
  injectedProvider?: any;
  requestWallet?: any;
  disconnectDapp?: any;
  injectedChain?: any;
  address?: any;
  web3Modal?: any;
  state?: any;
  dispatch?: React.Dispatch<any>;
}>({});

interface InjectedProviderProps {
  children: any;
}

export const InjectedProvider: React.FC<InjectedProviderProps> = ({
  children,
}: InjectedProviderProps) => {
  const [injectedProvider, setInjectedProvider]: any = useState(null);
  const [address, setAddress] = useState(null);
  const [injectedChain, setInjectedChain] = useState<Network>();
  const [web3Modal, setWeb3Modal] = useState(defaultModal);
  const toast = useToast();


  //Load provider from cache or connect default
  useEffect(() => {
    if (window.localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")) {
      console.log("Loading provider from cache");
      connectProvider();
    } else {
      console.log("Connecting default provider");
      const connectDefaultProvider = () => {
        const chain = chainByNetworkId("137");

        const defaultProvider = ethers.getDefaultProvider(chain.rpc_url);
        setInjectedChain(chain);
        setInjectedProvider(defaultProvider);
      };

      connectDefaultProvider();
    }
  }, []);

  const hasListeners: any = useRef(null);

  const connectProvider = async () => {
    const providerOptions = getProviderOptions();

    console.log("providerOptions: ", providerOptions);
    if (!providerOptions) {
      setInjectedChain(undefined);
      setInjectedProvider(null);
      setAddress(null);
      setWeb3Modal(defaultModal);
      window.localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
      toast({
        title: "Wrong network?",
        description: "If you have MetaMask, make sure it's connected to Polygon. You could use chainlist.org to automagically configure MetaMask",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top"
      });
      return;
    }

    const localWeb3Modal = new Web3Modal({
      providerOptions,
      cacheProvider: true,
      theme: "dark",
    });

    const [web3ModalProvider, web3] = await web3ModalToWeb3(localWeb3Modal);
    const chain = chainFromProvider(web3ModalProvider);

    if (web3?.provider?.selectedAddress) {
      const address = web3.provider.selectedAddress;
      setInjectedProvider(web3);
      setAddress(address);
      setInjectedChain(chain);
      setWeb3Modal(localWeb3Modal);
    }
  };

  // This useEffect handles the initialization of EIP-1193 listeners
  // https://eips.ethereum.org/EIPS/eip-1193

  useEffect(() => {
    const handleChainChange = async () => {
      console.log("CHAIN CHANGE");
      await connectProvider();
    };
    const accountsChanged = async () => {
      console.log("ACCOUNT CHANGE");
      await connectProvider();
    };

    const unsub = () => {
      if (injectedProvider?.currentProvider) {
        injectedProvider?.currentProvider.removeListener(
          "accountsChanged",
          handleChainChange
        );
        injectedProvider.currentProvider.removeListener(
          "chainChanged",
          accountsChanged
        );
      }
    };

    if (injectedProvider?.currentProvider && !hasListeners.current) {
      injectedProvider.currentProvider
        .on("accountsChanged", accountsChanged)
        .on("chainChanged", handleChainChange);
      hasListeners.current = true;
    }
    return () => unsub();
  }, [injectedProvider]);

  const requestWallet = async () => {
    await connectProvider();
  };

  const disconnectDapp = () => {
    setInjectedProvider(null);
    setAddress(null);
    setWeb3Modal(defaultModal);
    web3Modal.clearCachedProvider();
  };

  const web3ModalToWeb3 = async (
    web3Modal: Web3Modal
  ): Promise<[Web3Modal, any]> => {
    const web3Modalprovider = await web3Modal.connect();
    web3Modalprovider.selectedAddress =
      deriveSelectedAddress(web3Modalprovider);
    const web3 = new ethers.providers.Web3Provider(web3Modalprovider);

    console.log("InjectedProvider: ", web3);
    console.log("Web3Modal: ", web3Modalprovider);

    return [web3Modalprovider, web3];
  };

  const chainFromProvider = (web3Provider: any): Network => {
    const chainId = deriveChainId(web3Provider);

    const chain = {
      ...supportedChains[chainId],
      chainId,
    };

    console.log("Chain: ", chain);
    return chain;
  };

  return (
    <InjectedProviderContext.Provider
      value={{
        injectedProvider,
        requestWallet,
        disconnectDapp,
        injectedChain,
        address,
        web3Modal,
      }}
    >
      {children}
    </InjectedProviderContext.Provider>
  );
};

export const useInjectedProvider = () => {
  const {
    injectedProvider,
    requestWallet,
    disconnectDapp,
    injectedChain,
    address,
    web3Modal,
  } = useContext(InjectedProviderContext);
  return {
    injectedProvider,
    requestWallet,
    disconnectDapp,
    injectedChain,
    web3Modal,
    address,
  };
};
