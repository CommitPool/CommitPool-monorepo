import { formatEther, parseEther } from "@ethersproject/units";
import { BigNumber, Contract, ethers, providers } from "ethers";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Network, TransactionDetails, User } from "../types";
import { getApproval } from "../utils/contractInteractions";
import { useContracts } from "./contractContext";
import { useInjectedProvider } from "./injectedProviderContext";

type CurrentUserContextType = {
  currentUser: Partial<User>;
  latestTransaction: Partial<TransactionDetails>;
  refreshDaiAllowance: () => void;
  setCurrentUser: (user: Partial<User>) => void;
  setLatestTransaction: (txDetails: Partial<TransactionDetails>) => void;
};

export const CurrentUserContext = createContext<CurrentUserContextType>({
  currentUser: {},
  latestTransaction: {},
  refreshDaiAllowance: () => {},
  setCurrentUser: (user: Partial<User>) => {},
  setLatestTransaction: (txDetails: Partial<TransactionDetails>) => {},
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
  const { daiContract, spcContract } = useContracts();
  const [latestTransaction, setLatestTransaction] = useLocalStorage<
    Partial<TransactionDetails>
  >("tx", {});

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
    daiContract: Partial<Contract>
  ) => {
    if (
      injectedProvider &&
      daiContract &&
      spcContract &&
      spcContract.address &&
      currentUser.attributes?.["custom:account_address"]
    ) {
      const address: string = currentUser.attributes["custom:account_address"];
      const nativeTokenBalance: string = await provider
        .getBalance(address)
        .then((res: BigNumber) => ethers.utils.formatEther(res).toString());
      const daiBalance: string = await daiContract
        .balanceOf(address)
        .then((res: BigNumber) => ethers.utils.formatEther(res).toString());
      const daiAllowance: string = await getApproval(
        currentUser,
        spcContract.address,
        daiContract
      );
      setCurrentUser({
        ...currentUser,
        nativeTokenBalance,
        daiBalance,
        daiAllowance,
      });
    }
  };

  const refreshDaiAllowance = async () => {
    if (daiContract && spcContract?.address && currentUser) {
      const daiAllowance: string = await getApproval(
        currentUser,
        spcContract.address,
        daiContract
      );
      setCurrentUser({ ...currentUser, daiAllowance });
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
        refreshDaiAllowance,
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
    refreshDaiAllowance,
    setCurrentUser,
    setLatestTransaction,
  } = useContext(CurrentUserContext);
  return {
    currentUser,
    latestTransaction,
    refreshDaiAllowance,
    setCurrentUser,
    setLatestTransaction,
  };
};
