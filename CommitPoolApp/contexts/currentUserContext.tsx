import { BigNumber, Contract, ethers, providers } from "ethers";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Network, TransactionDetails, User } from "../types";
import { useContracts } from "./contractContext";
import { useInjectedProvider } from "./injectedProviderContext";

type CurrentUserContextType = {
  currentUser: Partial<User>;
  latestTransaction: TransactionDetails;
  setCurrentUser: (user: Partial<User>) => void;
  setLatestTransaction: (txDetails: TransactionDetails) => void;
};

export const CurrentUserContext = createContext<CurrentUserContextType>({
  currentUser: {},
  latestTransaction: { methodCall: undefined, txReceipt: undefined },
  setCurrentUser: (user: Partial<User>) => {},
  setLatestTransaction: (txDetails: TransactionDetails) => {},
});

interface CurrentUserProps {
  children: any;
}

//TODO User network vs. Provider network
export const CurrentUserContextProvider: React.FC<CurrentUserProps> = ({
  children,
}: CurrentUserProps) => {
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const { injectedChain, address, injectedProvider } = useInjectedProvider();
  const { daiContract } = useContracts();
  const [latestTransaction, setLatestTransaction] =
    useLocalStorage<TransactionDetails>("tx", {
      methodCall: undefined,
      txReceipt: undefined,
    });

  console.log("Current user:  ", currentUser);
  console.log("Latest tx: ", latestTransaction);

  useEffect(() => {
    const user: Partial<User> = createWeb3User(
      currentUser,
      address,
      injectedChain
    );

    setCurrentUser(user);
  }, [injectedProvider, injectedChain, address]);

  useEffect(() => {
    if (daiContract && injectedProvider) {
      addUserBalances(injectedProvider, currentUser, daiContract);
    }
  }, [daiContract, injectedProvider]);

  const addUserBalances = async (
    provider: any,
    currentUser: Partial<User>,
    daiContract: Contract
  ) => {
    if (
      injectedProvider &&
      daiContract &&
      currentUser.attributes?.["custom:account_address"]
    ) {
      const address: string = currentUser.attributes["custom:account_address"];
      const nativeTokenBalance: string = await provider
        .getBalance(address)
        .then((res: BigNumber) => ethers.utils.formatEther(res).toString());
      const daiBalance: string = await daiContract
        .balanceOf(address)
        .then((res: BigNumber) => ethers.utils.formatEther(res).toString());
      setCurrentUser({ ...currentUser, nativeTokenBalance, daiBalance });
    }
  };

  const createWeb3User = (
    currentUser: Partial<User>,
    accountAddress: string | "",
    network: Network
  ): Partial<User> => {
    const userName = currentUser?.username
      ? currentUser.username
      : accountAddress;
    return {
      ...currentUser,
      type: "web3",
      attributes: { "custom:account_address": accountAddress },
      network: network,
      username: userName,
    };
  };

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        latestTransaction,
        setCurrentUser,
        setLatestTransaction,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const {
    currentUser,
    latestTransaction,
    setCurrentUser,
    setLatestTransaction,
  } = useContext(CurrentUserContext);
  return {
    currentUser,
    latestTransaction,
    setCurrentUser,
    setLatestTransaction,
  };
};
